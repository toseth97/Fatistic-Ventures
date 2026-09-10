import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
    const staticRoutes = ["", "/shop", "/about", "/contact", "/terms", "/privacy", "/returns"].map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
    }));

    let productRoutes = [];
    let categoryRoutes = [];
    try {
        await connectDB();
        const [products, categories] = await Promise.all([
            Product.find({ published: true }).select("slug updatedAt").sort({ updatedAt: -1 }).limit(5000).lean(),
            Category.find({ published: true }).select("slug updatedAt").lean(),
        ]);
        productRoutes = products
            .filter((p) => p.slug)
            .map((p) => ({
                url: `${SITE_URL}/shop/${p.slug}`,
                lastModified: p.updatedAt || new Date(),
                changeFrequency: "weekly",
                priority: 0.8,
            }));
        categoryRoutes = categories
            .filter((c) => c.slug)
            .map((c) => ({
                url: `${SITE_URL}/shop?category=${encodeURIComponent(c.slug)}`,
                lastModified: c.updatedAt || new Date(),
                changeFrequency: "weekly",
                priority: 0.6,
            }));
    } catch {
        // DB unavailable — still return static routes.
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
