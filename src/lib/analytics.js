import mongoose from "mongoose";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { connectDB } from "@/lib/db";

const EVENT_TYPES = new Set(["page_view", "product_view", "whatsapp_click"]);

const analyticsSummarySchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        totals: {
            totalEvents: { type: Number, default: 0 },
            pageViews: { type: Number, default: 0 },
            productViews: { type: Number, default: 0 },
            whatsappClicks: { type: Number, default: 0 },
            desktopVisits: { type: Number, default: 0 },
            mobileVisits: { type: Number, default: 0 },
        },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

const AnalyticsSummary =
    mongoose.models.AnalyticsSummary ||
    mongoose.model("AnalyticsSummary", analyticsSummarySchema);

export async function trackEvent({ type, productId, meta = {} }) {
    if (!EVENT_TYPES.has(type)) {
        throw new Error(`Invalid analytics event type: ${type}`);
    }

    await connectDB();

    const device = (meta.device || "").toLowerCase();
    const referrer = meta.referrer || "";
    const userAgent = meta.userAgent || "";
    const ip = meta.ip || "";

    const event = await AnalyticsEvent.create({
        type,
        productId: productId || undefined,
        meta: {
            device,
            referrer,
            userAgent,
            ip,
        },
    });

    if (type === "whatsapp_click" && productId) {
        await mongoose.model("Product").findByIdAndUpdate(productId, {
            $inc: { whatsappClickCount: 1 },
        });
    }

    const summary = await AnalyticsSummary.findOneAndUpdate(
        { key: "site" },
        {
            $inc: {
                "totals.totalEvents": 1,
                "totals.pageViews": type === "page_view" ? 1 : 0,
                "totals.productViews": type === "product_view" ? 1 : 0,
                "totals.whatsappClicks": type === "whatsapp_click" ? 1 : 0,
                "totals.desktopVisits": device === "desktop" ? 1 : 0,
                "totals.mobileVisits": device === "mobile" ? 1 : 0,
            },
            $set: { updatedAt: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return { event, summary };
}
