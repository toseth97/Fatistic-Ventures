import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/middleware";
import { categoryCreateSchema, unpack } from "@/lib/validation";
import { requireSameOrigin, sanitizeText } from "@/lib/http";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp, rateLimit } from "@/lib/rateLimit";

await connectDB().catch(() => null);

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const admin = await requireAdminCheck(req);
        const filter = admin ? {} : { published: true };

        const [categories, counts] = await Promise.all([
            Category.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean(),
            admin
                ? Promise.resolve([])
                : Product.aggregate([
                      { $match: { published: true } },
                      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
                  ]),
        ]);

        const countMap = new Map(
            admin
                ? []
                : counts.filter((c) => c._id).map((c) => [String(c._id), c.count]),
        );

        const list = categories.map((c) => ({
            ...c,
            productCount: countMap.get(String(c._id)) || 0,
        }));

        return NextResponse.json({ categories: list });
    } catch (e) {
        console.error("[categories] GET error", e);
        return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const limiter = rateLimit(`categories:post:${clientIp(req)}`, 40, 60_000);
        if (!limiter.ok) {
            return NextResponse.json(
                { error: "Too many requests. Please try again shortly." },
                { status: 429 },
            );
        }

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(categoryCreateSchema, body);

        const normalizedName = parsed.name.toLowerCase();
        const existing = await Category.findOne({ name: normalizedName }).lean();
        if (existing) {
            return NextResponse.json(
                { error: "A category with this name already exists" },
                { status: 409 },
            );
        }

        const category = await Category.create({
            name: normalizedName,
            slug: parsed.name,
            displayName: sanitizeText(parsed.displayName),
            description: sanitizeText(parsed.description),
            image: parsed.image
                ? { url: parsed.image.url, publicId: parsed.image.publicId || "" }
                : undefined,
            published: parsed.published ?? true,
            featured: parsed.featured ?? false,
            sortOrder: parsed.sortOrder ?? 0,
            createdBy: admin?.email || "admin",
        });

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.categoryCreate,
            category: "category",
            targetId: String(category._id),
            ip: clientIp(req),
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (e) {
        console.error("[categories] POST error", e);
        return NextResponse.json(
            {
                error: e?.message || "Failed to create category",
                details: process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: 400 },
        );
    }
}

async function requireAdminCheck(req) {
    try {
        const result = await requireAdmin(req);
        return result.authorized ? result.admin : null;
    } catch {
        return null;
    }
}