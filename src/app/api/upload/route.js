import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { cloudinary as configuredCloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";

// Ensure DB connection is warmed (not required for upload, but keeps consistent patterns)
await connectDB().catch(() => null);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { error: "Missing file" },
                { status: 400 },
            );
        }

        const uploadResult = await configuredCloudinary.uploader.upload(
            // cloudinary expects a base64 data URI or a file buffer.
            // With Next.js form upload, `file` is a Blob. We convert to Buffer.
            Buffer.from(await file.arrayBuffer()),
            {
                folder: "fatistic_ventures/products",
                resource_type: "image",
                use_filename: true,
                unique_filename: true,
                // Optional: make images consistent
                transformation: [{ quality: "auto" }],
            },
        );

        return NextResponse.json({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        });
    } catch (e) {
        return NextResponse.json(
            { error: "Image upload failed", details: e?.message || String(e) },
            { status: 500 },
        );
    }
}
