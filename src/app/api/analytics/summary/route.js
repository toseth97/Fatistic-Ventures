import { NextResponse } from "next/server";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";

await connectDB().catch(() => null);

function safeInt(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

export async function GET(req) {
    try {
        const { requireAdmin } = await import("@/lib/middleware");
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        const url = new URL(req.url);
        const rangeDays = safeInt(url.searchParams.get("days"), 14);

        const since = new Date();
        since.setDate(since.getDate() - rangeDays);

        const [
            totalEvents,
            totalPageViews,
            totalProductViews,
            totalWhatsappClicks,
        ] = await Promise.all([
            AnalyticsEvent.countDocuments({ timestamp: { $gte: since } }),
            AnalyticsEvent.countDocuments({
                type: "page_view",
                timestamp: { $gte: since },
            }),
            AnalyticsEvent.countDocuments({
                type: "product_view",
                timestamp: { $gte: since },
            }),
            AnalyticsEvent.countDocuments({
                type: "whatsapp_click",
                timestamp: { $gte: since },
            }),
        ]);

        const productViews = await AnalyticsEvent.aggregate([
            {
                $match: {
                    type: "product_view",
                    productId: { $ne: null },
                    timestamp: { $gte: since },
                },
            },
            { $group: { _id: "$productId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        const whatsappClicks = await AnalyticsEvent.aggregate([
            {
                $match: {
                    type: "whatsapp_click",
                    productId: { $ne: null },
                    timestamp: { $gte: since },
                },
            },
            { $group: { _id: "$productId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        // Traffic by day (sum all event types)
        const traffic = await AnalyticsEvent.aggregate([
            { $match: { timestamp: { $gte: since } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$timestamp",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Basic visitor stats (device type)
        const visitorByDevice = await AnalyticsEvent.aggregate([
            { $match: { timestamp: { $gte: since } } },
            { $group: { _id: "$meta.device", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
        ]);

        // Enrich top lists with product info
        const topProductIds = Array.from(
            new Set([
                ...productViews.map((x) => String(x._id)),
                ...whatsappClicks.map((x) => String(x._id)),
            ]),
        );

        const products = await Product.find({ _id: { $in: topProductIds } })
            .select("name price category images")
            .lean();

        const byId = new Map(products.map((p) => [String(p._id), p]));

        const topViewed = productViews.map((x) => ({
            product: byId.get(String(x._id)) || null,
            count: x.count,
        }));

        const topWhatsApp = whatsappClicks.map((x) => ({
            product: byId.get(String(x._id)) || null,
            count: x.count,
        }));

        return NextResponse.json(
            {
                rangeDays,
                since: since.toISOString(),
                totals: {
                    totalEvents,
                    pageViews: totalPageViews,
                    productViews: totalProductViews,
                    whatsappClicks: totalWhatsappClicks,
                },
                topViewed,
                topWhatsApp,
                traffic,
                visitorByDevice,
            },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to build analytics summary",
                details: e?.message || String(e),
            },
            { status: 500 },
        );
    }
}
