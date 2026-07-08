import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

await connectDB().catch(() => null);

export async function GET() {
    try {
        const categories = await Category.find({})
            .sort({ createdAt: 1 })
            .lean();
        return NextResponse.json({ categories }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to load categories",
                details: e?.message || String(e),
            },
            { status: 500 },
        );
    }
}

export async function POST(req) {
    try {
        const { requireAdmin } = await import("@/lib/middleware");
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        const body = await req.json().catch(() => ({}));
        const name = String(body?.name || "").trim();
        const displayName = String(body?.displayName || name).trim();

        if (!name || !displayName) {
            return NextResponse.json(
                { error: "Category name is required" },
                { status: 400 },
            );
        }

        const normalizedName = name.toLowerCase();
        const existing = await Category.findOne({
            name: normalizedName,
        }).lean();
        if (existing) {
            return NextResponse.json({ category: existing }, { status: 200 });
        }

        const category = await Category.create({
            name: normalizedName,
            displayName,
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to create category",
                details: e?.message || String(e),
            },
            { status: 400 },
        );
    }
}
