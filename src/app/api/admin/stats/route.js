import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";
import { requireAdmin } from "@/lib/middleware";

await connectDB().catch(() => null);

export async function GET(req) {
    try {
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        const [productCount, categoryCount, userCount, orderCount, pendingCount, processingCount, shippedCount, revenueAgg] =
            await Promise.all([
                Product.countDocuments({}),
                Category.countDocuments({}),
                User.countDocuments({}),
                Order.countDocuments({}),
                Order.countDocuments({ status: "Pending" }),
                Order.countDocuments({ status: { $in: ["Processing", "Confirmed"] } }),
                Order.countDocuments({ status: "Shipped" }),
                Order.aggregate([
                    { $match: { paymentStatus: "Paid" } },
                    { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
                ]),
            ]);

        const revenue = revenueAgg[0]?.total || 0;
        const paidOrders = revenueAgg[0]?.count || 0;

        return NextResponse.json({
            products: productCount,
            categories: categoryCount,
            users: userCount,
            orders: orderCount,
            ordersPending: pendingCount,
            ordersProcessing: processingCount,
            ordersShipped: shippedCount,
            revenue,
            paidOrders,
            currency: "NGN",
        });
    } catch (e) {
        console.error("[admin:stats] GET error", e);
        return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
    }
}