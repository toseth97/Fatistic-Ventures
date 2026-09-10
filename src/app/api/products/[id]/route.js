import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { cloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/middleware";
import { productSchema, unpack } from "@/lib/validation";
import { requireSameOrigin, sanitizeText, isMongoId } from "@/lib/http";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp } from "@/lib/rateLimit";

await connectDB().catch(() => null);

async function findProduct(idOrSlug, { admin = false } = {}) {
    const query = isMongoId(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: String(idOrSlug || "").toLowerCase() };
    if (admin) return Product.findOne(query).lean();
    return Product.findOne({ ...query, published: true }).lean();
}

async function deleteImagesFromCloudinary(images = []) {
    const publicIds = (images || []).map((img) => img?.publicId).filter(Boolean);
    if (!publicIds.length) return;
    await Promise.all(
        publicIds.map(async (publicId) => {
            try {
                await cloudinary.uploader.destroy(publicId, { invalidate: true });
            } catch (_) {
                // Ignore individual cloud failures so deletion continues.
            }
        }),
    );
}

export async function GET(req, { params }) {
    try {
        let admin = null;
        try {
            const result = await requireAdmin(req);
            admin = result.authorized ? result.admin : null;
        } catch {
            admin = null;
        }
        const id = (await params)?.id;
        const product = await findProduct(id, { admin: !!admin });
        if (!product) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ product });
    } catch (e) {
        console.error("[products:id] GET error", e);
        return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const id = (await params)?.id;
        if (!isMongoId(id)) {
            return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
        }

        const existing = await Product.findById(id);
        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(productSchema.partial(), body);

        if (parsed.categoryId !== undefined) {
            const cat = parsed.categoryId
                ? await Category.findById(parsed.categoryId).lean()
                : null;
            if (parsed.categoryId && !cat) {
                return NextResponse.json(
                    { error: "categoryId: Category not found" },
                    { status: 400 },
                );
            }
            parsed.categoryId = cat?._id || null;
        }
        if (parsed.category !== undefined) {
            const cat = await Category.findOne({
                name: parsed.category.toLowerCase(),
            }).lean();
            if (cat) parsed.categoryId = cat._id;
        }

        const clean = {};
        if (parsed.name !== undefined) clean.name = sanitizeText(parsed.name);
        if (parsed.description !== undefined)
            clean.description = sanitizeText(parsed.description);
        if (parsed.price !== undefined) clean.price = parsed.price;
        if (parsed.compareAtPrice !== undefined)
            clean.compareAtPrice = parsed.compareAtPrice;
        if (parsed.quantity !== undefined) clean.quantity = parsed.quantity;
        if (parsed.category !== undefined) clean.category = parsed.category;
        if (parsed.categoryId !== undefined) clean.categoryId = parsed.categoryId;
        if (parsed.images !== undefined)
            clean.images = (parsed.images || []).map((img) => ({
                url: img.url,
                publicId: img.publicId || "",
            }));
        if (parsed.inStock !== undefined) clean.inStock = parsed.inStock;
        if (parsed.featured !== undefined) clean.featured = parsed.featured;
        if (parsed.published !== undefined) clean.published = parsed.published;

        const updated = await Product.findByIdAndUpdate(id, clean, {
            new: true,
            runValidators: true,
        }).lean();

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.productUpdate,
            category: "product",
            targetId: id,
            ip: clientIp(req),
            detail: { fields: Object.keys(clean) },
        });

        return NextResponse.json({ product: updated });
    } catch (e) {
        console.error("[products] PUT error", e);
        return NextResponse.json(
            {
                error: e?.message || "Failed to update product",
                details:
                    process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: 400 },
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const id = (await params)?.id;
        if (!isMongoId(id)) {
            return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
        }

        const product = await Product.findById(id).lean();
        if (!product) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await deleteImagesFromCloudinary(product.images);
        await Product.findByIdAndDelete(id);

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.productDelete,
            category: "product",
            targetId: id,
            ip: clientIp(req),
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[products] DELETE error", e);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}