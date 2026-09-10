import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { createOrder, generatePaymentReference } from "@/lib/order";
import { orderCreateSchema, unpack } from "@/lib/validation";
import { requireSameOrigin } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import {
    isPaystackConfigured,
    initializePaystackTransaction,
} from "@/lib/paystack";

const ORDER_PUBLIC_FIELDS =
    "orderNumber email items shipping subtotal deliveryFee total currency status paymentStatus paymentMethod createdAt";

export async function GET(req) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const url = new URL(req.url);
        const page = Math.max(1, Number(new URL(req.url).searchParams.get("page")) || 1);
        const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit")) || 10));

        const [total, orders] = await Promise.all([
            Order.countDocuments({ user: userId }),
            Order.find({ user: userId })
                .select(ORDER_PUBLIC_FIELDS)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);

        return NextResponse.json({
            orders,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        });
    } catch (e) {
        console.error("[orders] GET error", e);
        return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const limiter = rateLimit(`order:create:${clientIp(req)}`, 10, 60_000);
        if (!limiter.ok) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again shortly." },
                { status: 429 },
            );
        }

        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(orderCreateSchema, body);

        const { order, payment } = await createOrder({
            userId,
            shipping: parsed.shipping,
            paymentMethod: parsed.paymentMethod,
        });

        await securityLog({
            actor: String(userId),
            actorRole: "user",
            action: LOG_ACTIONS.orderCreate,
            category: "order",
            targetId: String(order._id),
            ip: clientIp(req),
            detail: { orderNumber: order.orderNumber, total: order.total },
        });

        // If the merchant wants Paystack and it's configured, start a checkout.
        let paymentUrl = null;
        let paymentReference = null;
        if (parsed.paymentMethod === "paystack" && isPaystackConfigured()) {
            paymentReference = generatePaymentReference(order.orderNumber);
            await Payment.updateOne(
                { _id: payment._id },
                { $set: { provider: "paystack", reference: paymentReference, amount: order.total } },
            );
            try {
                const txn = await initializePaystackTransaction({
                    email: order.email,
                    amountNaira: order.total,
                    reference: paymentReference,
                    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/account?payment=verify&ref=${encodeURIComponent(paymentReference)}`,
                    metadata: { orderNumber: order.orderNumber, orderId: String(order._id) },
                });
                paymentUrl = txn.authorization_url;
                await Order.updateOne(
                    { _id: order._id },
                    { $set: { paymentProviderRef: paymentReference } },
                );
            } catch (e) {
                console.error("[orders] paystack init failed", e);
                // Order still exists (pending); user can complete via alternate method.
            }
        }

        return NextResponse.json(
            {
                order: {
                    id: String(order._id),
                    orderNumber: order.orderNumber,
                    total: order.total,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    paymentMethod: order.paymentMethod,
                },
                paymentUrl,
                paymentReference,
                message:
                    paymentUrl
                        ? "Your order was placed. Complete payment to confirm it."
                        : "Your order was placed. We will contact you to arrange payment and delivery.",
            },
            { status: 201 },
        );
    } catch (e) {
        console.error("[orders] POST error", e);
        return NextResponse.json(
            {
                error: e?.message || "We could not place your order. Please try again.",
                details:
                    process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: e?.status || 400 },
        );
    }
}