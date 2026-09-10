import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { isMongoId } from "@/lib/http";

// Users can ONLY see their own orders (IDOR/BOLA protection enforced server-side).
export async function GET(req, { params }) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const id = (await params)?.id;
        if (!isMongoId(id)) {
            return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
        }

        const order = await Order.findOne({
            _id: id,
            user: userId, // scope to the authenticated owner
        }).lean();

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const payment = await Payment.findOne({ order: order._id })
            .select("provider reference amount status createdAt")
            .lean();

        return NextResponse.json({ order, payment });
    } catch (e) {
        console.error("[orders:id] GET error", e);
        return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
    }
}