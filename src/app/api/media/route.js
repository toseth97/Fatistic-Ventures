import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/middleware";
import { cleanInt } from "@/lib/http";

await connectDB().catch(() => null);

export async function GET(req) {
    try {
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        const url = new URL(req.url);
        const purpose = (url.searchParams.get("purpose") || "").slice(0, 20);
        const page = Math.max(1, cleanInt(url.searchParams.get("page"), { min: 1, max: 100000 }) || 1);
        const limit = Math.min(60, Math.max(1, cleanInt(url.searchParams.get("limit"), { min: 1, max: 100 }) || 24));

        const filter = purpose ? { purpose } : {};
        const [total, media] = await Promise.all([
            Media.countDocuments(filter),
            Media.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);

        return NextResponse.json({
            media,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        });
    } catch (e) {
        console.error("[media] GET error", e);
        return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
    }
}