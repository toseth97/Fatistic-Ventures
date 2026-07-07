import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { cloudinary } from "@/lib/cloudinary";

await connectDB().catch(() => null);

function isValidMongoId(id) {
    return /^[a-f\d]{24}$/i.test(id);
}

async function deleteImagesFromCloudinary(images = []) {
    const publicIds = images.map((img) => img?.publicId).filter(Boolean);

    if (!publicIds.length) return;

    await Promise.all(
        publicIds.map(async (publicId) => {
            try {
                await cloudinary.uploader.destroy(publicId, {
                    invalidate: true,
                });
            } catch (_) {
                // Intentionally ignore individual failures to allow product deletion.
            }
        }),
    );
}

export async function GET(req, { params }) {
    try {
        const { id } = params;
        if (!isValidMongoId(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const product = await Product.findById(id).lean();
        if (!product) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ product }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to fetch product",
                details: e?.message || String(e),
            },
            { status: 500 },
        );
    }
}

export async function PUT(req, { params }) {
    try {
        const { requireAdmin } = await import("@/lib/middleware");
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        const { id } = params;
        if (!isValidMongoId(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const body = await req.json();

        const existing = await Product.findById(id).lean();

        const updated = await Product.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        }).lean();

        return NextResponse.json(
            { product: updated || existing },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to update product",
                details: e?.message || String(e),
            },
            { status: 400 },
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const { requireAdmin } = await import("@/lib/middleware");
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        const { id } = params;
        if (!isValidMongoId(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const product = await Product.findById(id).lean();
        if (!product) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await deleteImagesFromCloudinary(product.images);
        await Product.findByIdAndDelete(id);

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to delete product",
                details: e?.message || String(e),
            },
            { status: 500 },
        );
    }
}
