import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { cloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/middleware";
import { requireSameOrigin, isMongoId } from "@/lib/http";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp } from "@/lib/rateLimit";

await connectDB().catch(() => null);

export async function DELETE(req, { params }) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const id = (await params)?.id;
        if (!isMongoId(id)) {
            return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
        }

        const media = await Media.findById(id).lean();
        if (!media) {
            return NextResponse.json({ error: "Media not found" }, { status: 404 });
        }

        if (media.publicId) {
            try {
                await cloudinary.uploader.destroy(media.publicId, { invalidate: true });
            } catch (_) {
                // continue with DB removal
            }
        }
        await Media.findByIdAndDelete(id);

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.mediaDelete,
            category: "upload",
            targetId: String(media._id),
            ip: clientIp(req),
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[media] DELETE error", e);
        return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}