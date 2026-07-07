import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(req) {
    try {
        const body = await req.json();

        const type = body?.type;
        const productId = body?.productId;
        const meta = body?.meta || {};

        const userAgent = req.headers.get("user-agent") || "";
        const referrer = req.headers.get("referer") || "";
        const forwardedFor = req.headers.get("x-forwarded-for") || "";
        const ip = forwardedFor
            ? String(forwardedFor).split(",")[0].trim()
            : "";

        const enrichedMeta = {
            device: meta.device || "",
            referrer,
            userAgent,
            ip,
        };

        await trackEvent({ type, productId, meta: enrichedMeta });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to track analytics",
                details: e?.message || String(e),
            },
            { status: 400 },
        );
    }
}
