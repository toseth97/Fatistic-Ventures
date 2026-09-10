import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/middleware";
import { productSchema, unpack } from "@/lib/validation";
import { requireSameOrigin, sanitizeText, cleanInt } from "@/lib/http";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp } from "@/lib/rateLimit";

await connectDB().catch(() => null);

const SORTS = {
    newest: { createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    popular: { whatsappClickCount: -1 },
};

function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

async function requireAdminCheck(req) {
    try {
        const result = await requireAdmin(req);
        return result.authorized ? result.admin : null;
    } catch {
        return null;
    }
}

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
        const category = (url.searchParams.get("category") || "").trim().slice(0, 100);
        const minPrice = toNumber(url.searchParams.get("minPrice"));
        const maxPrice = toNumber(url.searchParams.get("maxPrice"));
        const inStockOnly =
            url.searchParams.get("inStock") === "true" ||
            url.searchParams.get("availability") === "in_stock";
        const featuredOnly = url.searchParams.get("featured") === "true";
        const sortKey = url.searchParams.get("sort");
        const sort = SORTS[sortKey] ? sortKey : "newest";
        const page = Math.max(1, toNumber(url.searchParams.get("page"), 1) || 1);
        const limit = Math.min(
            60,
            Math.max(1, toNumber(url.searchParams.get("limit"), 24) || 24),
        );

        // Admins (valid bearer token) may also see unpublished products.
        const admin = await requireAdminCheck(req);

        const filter = {};
        if (!admin) filter.published = true;
        if (featuredOnly) filter.featured = true;

        if (category) {
            const catDoc = await Category.findOne({
                $or: [{ slug: category }, { name: category.toLowerCase() }],
            }).lean();
            if (catDoc) {
                filter.$or = [
                    { categoryId: catDoc._id },
                    { category: catDoc.name },
                    { category: catDoc.displayName },
                ];
            } else {
                filter.category = category;
            }
        }

        if (minPrice > 0 || maxPrice > 0) {
            filter.price = {};
            if (minPrice > 0) filter.price.$gte = minPrice;
            if (maxPrice > 0) filter.price.$lte = maxPrice;
        }
        if (inStockOnly) filter.inStock = true;

        if (q) {
            const rx = new RegExp(escapeRegex(q), "i");
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { name: rx },
                    { description: rx },
                    { category: rx },
                ],
            });
        }

        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .sort(SORTS[sort])
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);

        return NextResponse.json({
            products,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            filters: {
                q,
                category,
                minPrice,
                maxPrice,
                inStockOnly,
                featuredOnly,
                sort,
            },
        });
    } catch (e) {
        console.error("[products] GET error", e);
        return NextResponse.json(
            {
                error: "Failed to load products",
                details:
                    process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: 500 },
        );
    }
}

export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(productSchema, body);

        const categoryExists = parsed.categoryId
            ? await Category.findById(parsed.categoryId).lean()
            : await Category.findOne({ name: parsed.category.toLowerCase() }).lean();

        const categoryName = parsed.category || categoryExists?.name || "Other";
        const categoryId = parsed.categoryId || categoryExists?._id || null;

        const payload = {
            name: sanitizeText(parsed.name),
            description: sanitizeText(parsed.description),
            price: parsed.price,
            compareAtPrice: parsed.compareAtPrice ?? null,
            quantity: parsed.quantity,
            category: categoryName,
            categoryId,
            images: (parsed.images || []).map((img) => ({
                url: img.url,
                publicId: img.publicId || "",
            })),
            inStock: parsed.inStock ?? true,
            featured: parsed.featured ?? false,
            published: parsed.published ?? true,
        };

        let product;
        try {
            product = await Product.create(payload);
        } catch (e) {
            // Retry once on a slug collision by adding a random suffix.
            if (e?.code === 11000 && String(e?.message || "").includes("slug")) {
                product = await Product.create({
                    ...payload,
                    slug: `${payload.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product"}-${Date.now().toString(36)}`,
                });
            } else {
                throw e;
            }
        }

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.productCreate,
            category: "product",
            targetId: String(product._id),
            ip: clientIp(req),
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (e) {
        console.error("[products] POST error", e);
        return NextResponse.json(
            {
                error: e?.message || "Failed to create product",
                details:
                    process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: 400 },
        );
    }
}
