import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { requireSameOrigin, isMongoId } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";

// Server-side verification of a Paystack payment. The browser's success page is
// NOT trusted; the reference is re-verified against the Paystack API.
export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const limiter = rateLimit(`paystack:verify:${clientIp(req)}`, 20, 60_000);
        if (!limiter.ok) {
            return NextResponse.json(
                { error: "Too many requests. Please try again shortly." },
                { status: 429 },
            );
        }

        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const { reference, orderId } = await req.json().catch(() => ({}));
        const ref = String(reference || "").trim();
        if (!ref || ref.length > 100) {
            return NextResponse.json({ error: "A payment reference is required" }, { status: 400 });
        }
        if (orderId && !isMongoId(orderId)) {
            return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
        }

        // The order, when provided, must belong to the session user.
        let order = null;
        if (orderId) {
            order = await Order.findOne({ _id: orderId, user: userId }).lean();
            if (!order) {
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }
        }

        const txn = await verifyPaystackTransaction(ref);
        const data = txn?.data || {};
        const amountPaid = Number(data.amount || 0) / 100; // kobo -> Naira
        const paidStatus = String(data.status || "").toLowerCase();

        // Only accept verified, successful transactions.
        if (paidStatus !== "success") {
            return NextResponse.json(
                { verified: false, message: "Payment was not completed." },
                { status: 200 },
            );
        }

        // Find the matching payment row (scoped to the order if provided).
        const paymentFilter = { reference: ref };
        const payment = await Payment.findOne(paymentFilter).lean();
        if (!payment) {
            if (order && Math.abs(amountPaid - order.total) < 0.01) {
                // Create a payment row if the webhook hadn't done so yet.
                await Payment.create({
                    order: order._id,
                    orderNumber: order.orderNumber,
                    provider: "paystack",
                    reference: ref,
                    amount: amountPaid,
                    currency: "NGN",
                    status: "success",
                    verifiedAt: new Date(),
                });
                await Order.updateOne(
                    { _id: order._id },
                    { $set: { paymentStatus: "Paid" } },
                );
                return NextResponse.json({ verified: true, amount: amountPaid });
            }
            return NextResponse.json(
                { verified: false, message: "Payment reference not found for this store." },
                { status: 200 },
            );
        }

        // Verify the amount matches our recorded order to prevent tampering.
        const orderDoc = await Order.findById(payment.order).lean();
        if (!orderDoc) {
            return NextResponse.json({ verified: false, message: "Order not found." }, { status: 404 });
        }
        if (Math.abs(amountPaid - orderDoc.total) > 0.01) {
            console.error("[paystack] amount mismatch", { ref, amountPaid, expected: orderDoc.total });
            return NextResponse.json(
                { verified: false, message: "Payment amount does not match the order." },
                { status: 409 },
            );
        }

        await Payment.updateOne(
            { _id: payment._id },
            { $set: { status: "success", verifiedAt: new Date() } },
        );
        await Order.updateOne(
            { _id: orderDoc._id },
            { $set: { paymentStatus: "Paid" } },
        );

        await securityLog({
            actor: String(userId),
            action: LOG_ACTIONS.paymentVerified,
            category: "payment",
            targetId: String(orderDoc._id),
            ip: clientIp(req),
            detail: { reference: ref, amount: amountPaid, provider: "paystack" },
        });

        return NextResponse.json({
            verified: true,
            amount: amountPaid,
            orderNumber: orderDoc.orderNumber,
        });
    } catch (e) {
        console.error("[payments] verify error", e);
        return NextResponse.json(
            {
                error: "Payment verification failed. Please try again.",
                details: process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: e?.status || 500 },
        );
    }
}