import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

await connectDB().catch(() => null);

function toProductQuery(searchParams) {
    const q = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category") || "";
    const inStock = searchParams.get("inStock");

    return { q, category, inStock };
}

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const { q, category, inStock } = toProductQuery(url.searchParams);

        const filter = {};

        if (category) {
            filter.category = {
                $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            };
        }
        if (inStock === "true") filter.inStock = true;

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } },
            ];
        }

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ products }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to fetch products",
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

        const body = await req.json();
        const product = await Product.create(body);
        return NextResponse.json({ product }, { status: 201 });
    } catch (e) {
        return NextResponse.json(
            {
                error: "Failed to create product",
                details: e?.message || String(e),
            },
            { status: 400 },
        );
    }
}
