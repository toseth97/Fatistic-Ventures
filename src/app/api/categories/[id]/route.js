import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { cloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/middleware";
import { categoryUpdateSchema, unpack } from "@/lib/validation";
import { requireSameOrigin, sanitizeText, isMongoId } from "@/lib/http";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp } from "@/lib/rateLimit";

await connectDB().catch(() => null);

async function deleteCategoryImage(image) {
    if (image?.publicId) {
        try {
            await cloudinary.uploader.destroy(image.publicId, { invalidate: true });
        } catch (_) {}
    }
}

export async function GET(req, { params }) {
    try {
        const idOrSlug = (await params)?.id;
        const query = isMongoId(idOrSlug)
            ? { _id: idOrSlug }
            : { slug: String(idOrSlug || "").toLowerCase() };
        const category = await Category.findOne(query).lean();
        if (!category) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const productCount = await Product.countDocuments({
            $or: [{ categoryId: category._id }, { category: category.name }],
            published: true,
        });
        return NextResponse.json({ category: { ...category, productCount } });
    } catch (e) {
        console.error("[categories:id] GET error", e);
        return NextResponse.json({ error: "Failed to load category" }, { status: 500 });
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
            return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
        }

        const existing = await Category.findById(id).lean();
        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(categoryUpdateSchema, body);

        if (parsed.name !== undefined) {
            const normalized = parsed.name.toLowerCase();
            const dup = await Category.findOne({
                name: normalized,
                _id: { $ne: id },
            }).lean();
            if (dup) {
                return NextResponse.json(
                    { error: "A category with this name already exists" },
                    { status: 409 },
                );
            }
        }

        const clean = {};
        if (parsed.name !== undefined) clean.name = parsed.name.toLowerCase();
        if (parsed.displayName !== undefined)
            clean.displayName = sanitizeText(parsed.displayName);
        if (parsed.description !== undefined)
            clean.description = sanitizeText(parsed.description);
        if (parsed.published !== undefined) clean.published = parsed.published;
        if (parsed.featured !== undefined) clean.featured = parsed.featured;
        if (parsed.sortOrder !== undefined) clean.sortOrder = parsed.sortOrder;
        if (parsed.image !== undefined) {
            if (parsed.image === null) {
                await deleteCategoryImage(id);
                clean.image = { url: "", publicId: "" };
            } else {
                clean.image = {
                    url: parsed.image.url,
                    publicId: parsed.image.publicId || "",
                };
            }
        }

        const updated = await Category.findByIdAndUpdate(id, clean, {
            new: true,
            runValidators: true,
        }).lean();

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.categoryUpdate,
            category: "category",
            targetId: id,
            ip: clientIp(req),
            detail: { fields: Object.keys(clean).filter((k) => k !== "image") },
        });

        return NextResponse.json({ category: updated });
    } catch (e) {
        console.error("[categories] PUT error", e);
        return NextResponse.json(
            {
                error: e?.message || "Failed to update category",
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
            return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
        }

        const category = await Category.findById(id).lean();
        if (!category) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Reassign products to "Other" so nothing is orphaned.
        await Product.updateMany(
            { $or: [{ categoryId: id }, { category: category.name }] },
            { $set: { category: "Other", categoryId: null } },
        );

        await deleteCategoryImage(category);
        await Category.findByIdAndDelete(id);

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.categoryDelete,
            category: "category",
            targetId: id,
            ip: clientIp(req),
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[categories] DELETE error", e);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}