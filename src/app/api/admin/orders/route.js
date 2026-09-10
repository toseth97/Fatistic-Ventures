import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/middleware";
import { isMongoId } from "@/lib/http";
import { clientIp } from "@/lib/rateLimit";

await connectDB().catch(() => null);

export async function GET(req) {
    try {
        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const url = new URL(req.url);
        const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
        const status = (url.searchParams.get("status") || "").trim().slice(0, 30);
        const paymentStatus = (url.searchParams.get("paymentStatus") || "").trim().slice(0, 30);
        const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
        const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 15));

        const filter = {};
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (q) {
            filter.$or = [
                { orderNumber: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
                { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
                { "shipping.fullName": { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            ];
        }

        const [total, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
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
            admin: admin?.email,
        });
    } catch (e) {
        console.error("[admin:orders] GET error", e);
        return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}