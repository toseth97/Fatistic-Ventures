import AnalyticsEvent from "@/models/AnalyticsEvent";
import { connectDB } from "@/lib/db";

const EVENT_TYPES = new Set(["page_view", "product_view", "whatsapp_click"]);

export async function trackEvent({ type, productId, meta = {} }) {
    if (!EVENT_TYPES.has(type)) {
        throw new Error(`Invalid analytics event type: ${type}`);
    }

    await connectDB();

    const device = meta.device || "";
    const referrer = meta.referrer || "";
    const userAgent = meta.userAgent || "";
    const ip = meta.ip || "";

    await AnalyticsEvent.create({
        type,
        productId: productId || undefined,
        meta: {
            device,
            referrer,
            userAgent,
            ip,
        },
    });
}
