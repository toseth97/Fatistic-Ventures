import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/middleware";
import { requireSameOrigin } from "@/lib/http";
import { validateImage, MAX_IMAGE_BYTES } from "@/lib/security";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp, rateLimit } from "@/lib/rateLimit";

await connectDB().catch(() => null);

const PURPOSES = new Set(["product", "category", "banner", "hero", "site", "other"]);

export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const limiter = rateLimit(`upload:${clientIp(req)}`, 30, 60_000);
        if (!limiter.ok) {
            return NextResponse.json(
                { error: "Too many uploads. Please wait a moment." },
                { status: 429 },
            );
        }

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const formData = await req.formData();
        const file = formData.get("file");
        const purposeRaw = String(formData.get("purpose") || "other").trim().slice(0, 20);
        const purpose = PURPOSES.has(purposeRaw) ? purposeRaw : "other";

        if (!file || typeof file.arrayBuffer !== "function") {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const check = validateImage(buffer);
        if (!check.ok) {
            return NextResponse.json({ error: check.error }, { status: 400 });
        }

        // Safe unique filename (never trusts the client filename).
        const now = new Date();
        const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
            now.getUTCDate(),
        ).padStart(2, "0")}-${Date.now().toString(36)}`;
        const generated = `fatistic_ventures/${purpose}/${stamp}.${check.ext}`;

        const uploadResult = await cloudinary.uploader.upload(
            buffer,
            {
                public_id: generated,
                folder: false,
                resource_type: "image",
                transformation: [{ quality: "auto:good", fetch_format: "auto" }],
            },
        );

        const media = await Media.create({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: check.ext,
            width: check.width,
            height: check.height,
            bytes: buffer.length,
            purpose,
            uploadedBy: admin?.email || "admin",
        });

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.upload,
            category: "upload",
            targetId: String(media._id),
            ip: clientIp(req),
            detail: { purpose, format: check.ext, bytes: buffer.length },
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            id: String(media._id),
            format: check.ext,
            width: check.width,
            height: check.height,
            bytes: buffer.length,
        });
    } catch (e) {
        console.error("[upload] failed", e);
        return NextResponse.json(
            {
                error: "Image upload failed",
                details: process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: 500 },
        );
    }
}

export { MAX_IMAGE_BYTES as MAX_UPLOAD_BYTES };