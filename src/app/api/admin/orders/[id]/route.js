import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/middleware";
import { requireSameOrigin, isMongoId } from "@/lib/http";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp } from "@/lib/rateLimit";

await connectDB().catch(() => null);

const VALID_STATUSES = new Set([
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
]);
const VALID_PAYMENT_STATUSES = new Set(["Pending", "Paid", "Failed", "Refunded"]);

export async function GET(req, { params }) {
    try {
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        const id = (await params)?.id;
        if (!isMongoId(id)) {
            return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
        }
        const order = await Order.findById(id).lean();
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        const Payment = (await import("@/models/Payment")).default;
        const payment = await Payment.findOne({ order: order._id }).lean();
        return NextResponse.json({ order, payment });
    } catch (e) {
        console.error("[admin:orders:id] GET error", e);
        return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const id = (await params)?.id;
        if (!isMongoId(id)) {
            return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
        }

        const { status, paymentStatus, note } = await req.json().catch(() => ({}));

        const update = {};
        const history = [];

        if (status !== undefined) {
            if (!VALID_STATUSES.has(status)) {
                return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
            }
            update.status = status;
            history.push({
                status,
                note: String(note || "").slice(0, 500),
                at: new Date(),
                byName: admin?.email || "admin",
            });

            // A cancelled order frees its inventory back.
            if (status === "Cancelled") {
                const orderDoc = await Order.findById(id).lean();
                const Product = (await import("@/models/Product")).default;
                const ops = (orderDoc?.items || []).map((item) =>
                    Product.updateOne(
                        { _id: item.product },
                        { $inc: { quantity: item.quantity } },
                    ),
                );
                await Promise.all(ops);
            }
        }

        if (paymentStatus !== undefined) {
            if (!VALID_PAYMENT_STATUSES.has(paymentStatus)) {
                return NextResponse.json(
                    { error: "Invalid payment status" },
                    { status: 400 },
                );
            }
            update.paymentStatus = paymentStatus;
        }

        if (note !== undefined && status === undefined) {
            update.notes = String(note).slice(0, 1000);
        }

        if (update.status)
            update.$push = { statusHistory: history[0] };

        const updated = await Order.findByIdAndUpdate(id, update, {
            new: true,
        }).lean();

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.orderStatusUpdate,
            category: "order",
            targetId: id,
            ip: clientIp(req),
            detail: { status, paymentStatus },
        });

        return NextResponse.json({ order: updated });
    } catch (e) {
        console.error("[admin:orders] PATCH error", e);
        return NextResponse.json(
            { error: e?.message || "Failed to update order" },
            { status: 400 },
        );
    }
}