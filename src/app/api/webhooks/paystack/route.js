import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import { isValidPaystackWebhook } from "@/lib/paystack";
import { clientIp } from "@/lib/rateLimit";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";

// ---------------------------------------------------------------------------
// Paystack webhook. Always verifies the provider signature (HMAC-SHA512 of the
// raw body using the secret key) before acting. Idempotent — a repeated event
// with an already-"success" payment is a no-op.
// ---------------------------------------------------------------------------

export async function POST(req) {
    try {
        const rawBody = await req.text();

        if (process.env.PAYSTACK_DISABLE_WEBHOOK === "true") {
            // Webhooks disabled in test/dev: return 200 so the provider stops retrying.
            return NextResponse.json({ ok: true });
        }

        const signature = req.headers.get("x-paystack-signature") || "";
        if (!isValidPaystackWebhook(rawBody, signature)) {
            await securityLog({
                actor: "unknown",
                action: "paystack.webhook.rejected",
                category: "payment",
                ip: clientIp(req),
                outcome: "blocked",
            });
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        let event;
        try {
            event = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: "Invalid body" }, { status: 400 });
        }

        // Typical events: charge.success, transfer.success, etc.
        const eventType = String(event?.event || "");
        if (!eventType.endsWith(".success")) {
            return NextResponse.json({ ok: true }); // ignore non-success events
        }

        const reference = String(event?.data?.reference || "").trim();
        const amountKobo = Number(event?.data?.amount || 0);
        const amountNaira = Number.isFinite(amountKobo) ? amountKobo / 100 : 0;
        const metaOrderId = event?.data?.metadata?.orderId || "";

        if (!reference) {
            return NextResponse.json({ error: "Missing reference" }, { status: 400 });
        }

        await connectDB();

        const payment = await Payment.findOne({ reference }).lean();

        // Idempotency: already handled.
        if (payment && payment.status === "success") {
            return NextResponse.json({ ok: true });
        }

        let orderId = payment?.order
            ? String(payment.order)
            : String(metaOrderId || "");

        if (!orderId) {
            // Fall back to matching by order number in metadata.
            const orderNumber = event?.data?.metadata?.orderNumber || "";
            if (orderNumber) {
                const byNumber = await Order.findOne({ orderNumber }).lean();
                if (byNumber) orderId = String(byNumber._id);
            }
        }
        if (!orderId) {
            console.error("[webhook] no matching order for reference", reference);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const order = await Order.findById(orderId).lean();
        if (!order) {
            console.error("[webhook] order not found", orderId);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Amount sanity check: never mark a payment paid unless amounts match.
        if (Math.abs(amountNaira - order.total) > 0.01) {
            console.error("[webhook] amount mismatch", {
                reference,
                amountNaira,
                expected: order.total,
            });
            return NextResponse.json({ error: "Amount mismatch" }, { status: 409 });
        }

        await Payment.updateOne(
            { reference },
            {
                $set: {
                    order: order._id,
                    orderNumber: order.orderNumber,
                    provider: "paystack",
                    amount: amountNaira,
                    status: "success",
                    verifiedAt: new Date(),
                    rawWebhookPartial: {
                        event: eventType,
                        reference,
                        amount: amountNaira,
                    },
                },
            },
            { upsert: true },
        );

        await Order.updateOne(
            { _id: order._id },
            {
                $set: { paymentStatus: "Paid", paymentProviderRef: reference },
            },
        );

        await securityLog({
            actor: "paystack-webhook",
            action: LOG_ACTIONS.paymentVerified,
            category: "payment",
            targetId: String(order._id),
            ip: clientIp(req),
            outcome: "success",
            detail: { reference, amount: amountNaira, event: eventType },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[webhooks/paystack] error", e);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}