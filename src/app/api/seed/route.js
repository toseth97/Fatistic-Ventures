import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/middleware";

// Development-only seeder. Never run in production.
export async function POST(req) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "Seeding is disabled in production" },
            { status: 403 },
        );
    }

    try {
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        await connectDB();

        const Product = (await import("@/models/Product")).default;
        const Category = (await import("@/models/Category")).default;
        const AdminUser = (await import("@/models/AdminUser")).default;
        const SiteSetting = (await import("@/models/SiteSetting")).default;

        const IMG = (name) =>
            `https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/${name}`;

        const categoryDefs = [
            { name: "aso-oke", displayName: "Aso-Oke", image: "aso-oke-blue.jpg", featured: true, description: "Handwoven Aso-Oke — rich texture and heritage detail." },
            { name: "gele", displayName: "Gele", image: "gele-pink.jpg", featured: true, description: "Elegant Gele headwraps, pre-tied and ready to wear." },
            { name: "damask", displayName: "Damask", image: "damask-green.jpg", featured: true, description: "Premium Damask weaves with timeless presence." },
            { name: "lace", displayName: "Lace", image: "lace-white.jpg", featured: false, description: "Delicate, ornate lace for weddings and special occasions." },
            { name: "satin", displayName: "Satin", image: "satin-gold.jpg", featured: false, description: "Silky, lustrous satin with a smooth drape." },
            { name: "velvet", displayName: "Velvet", image: "velvet-burgundy.jpg", featured: false, description: "Plush velvet with rich depth and color." },
            { name: "cotton", displayName: "Cotton", image: "cotton-print.jpg", featured: false, description: "Breathable, comfortable cotton in bold prints." },
            { name: "silk", displayName: "Silk", image: "silk-ivory.jpg", featured: false, description: "Luxurious natural silk with a natural sheen." },
            { name: "brocade", displayName: "Brocade", image: "brocade-gold.jpg", featured: false, description: "Ornate brocade with raised metallic patterns." },
            { name: "chiffon", displayName: "Chiffon", image: "chiffon-sage.jpg", featured: false, description: "Sheer, lightweight chiffon for flowing designs." },
        ];

        const catMap = {};
        for (const def of categoryDefs) {
            const cat = await Category.findOneAndUpdate(
                { name: def.name },
                {
                    $set: {
                        displayName: def.displayName,
                        description: def.description,
                        image: { url: IMG(def.image), publicId: `sample_${def.name}` },
                        featured: def.featured,
                        published: true,
                        sortOrder: 0,
                    },
                    $setOnInsert: { name: def.name, slug: def.name },
                },
                { upsert: true, new: true },
            ).lean();
            catMap[def.name] = cat;
        }

        const productDefs = [
            { name: "Premium Aso-Oke Blue", category: "aso-oke", price: 45000, qty: 24, featured: true, desc: "Handwoven premium Aso-Oke fabric in deep blue with subtle gold threads. Perfect for traditional ceremonies, weddings, and special occasions. Each piece is uniquely crafted by skilled artisans." },
            { name: "Royal Aso-Oke Gold", category: "aso-oke", price: 65000, qty: 12, featured: false, desc: "Exquisite royal Aso-Oke with intricate gold patterns on a rich burgundy base. A statement piece for the discerning gentleman or lady." },
            { name: "Elegant Gele Pink", category: "gele", price: 15000, qty: 40, featured: true, desc: "Beautifully structured Gele headwrap in soft pink. Pre-tied and ready to wear." },
            { name: "Classic Gele White", category: "gele", price: 12000, qty: 35, featured: false, desc: "Timeless white Gele headwrap, perfect for weddings and church events." },
            { name: "Luxury Damask Green", category: "damask", price: 35000, qty: 18, featured: true, desc: "Premium Damask fabric in rich emerald green with a subtle woven pattern." },
            { name: "Gold Damask Brocade", category: "damask", price: 55000, qty: 9, featured: false, desc: "Opulent gold Damask brocade with intricate floral patterns." },
            { name: "Ivory Bridal Lace", category: "lace", price: 28000, qty: 22, featured: false, desc: "Delicate ivory lace with ornate floral embroidery — a favourite for bridal couture." },
            { name: "Champagne Satin", category: "satin", price: 19000, qty: 30, featured: false, desc: "Lustrous champagne satin that drapes like a dream." },
            { name: "Burgundy Velvet", category: "velvet", price: 24000, qty: 16, featured: false, desc: "Plush burgundy velvet with a soft, rich hand-feel." },
            { name: "Adire Ankara Cotton", category: "cotton", price: 9500, qty: 60, featured: true, desc: "Vibrant Adire-inspired ankara cotton prints, breathable and versatile." },
            { name: "Natural Silk Ivory", category: "silk", price: 32000, qty: 10, featured: false, desc: "Pure natural silk in ivory, with an effortless sheen." },
            { name: "Sage Green Chiffon", category: "chiffon", price: 13500, qty: 45, featured: false, desc: "Sheer sage chiffon — light, airy, and perfect for flowing gowns." },
        ];

        await Product.deleteMany({});
        for (const p of productDefs) {
            const cat = catMap[p.category];
            const imgName = `${p.category}-${String(p.name).split(" ")[0]?.toLowerCase() || "x"}.jpg`;
            await Product.create({
                name: p.name,
                description: p.desc,
                price: p.price,
                quantity: p.qty,
                category: cat ? cat.displayName : "Other",
                categoryId: cat ? cat._id : null,
                images: [{ url: IMG(imgName), publicId: `sample_${p.category}_${Date.now().toString(36)}` }],
                inStock: true,
                featured: p.featured,
                published: true,
            });
        }

        // Admin account comes from environment variables (never a hardcoded default).
        const adminUsername = (process.env.ADMIN_USERNAME || "fatistic_admin").trim().toLowerCase();
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || `${adminUsername}@fatistic.com`;
        const adminPassword = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD;
        if (adminPassword) {
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            await AdminUser.updateOne(
                { username: adminUsername },
                {
                    $set: {
                        email: adminEmail,
                        username: adminUsername,
                        hashedPassword,
                        role: "admin",
                    },
                },
                { upsert: true },
            );
        }

        await SiteSetting.updateOne(
            { key: "hero" },
            {
                $set: {
                    value: {
                        eyebrow: "Fatistic Ventures",
                        title: "Timeless Nigerian Fabrics",
                        subtitle: "Aso-Oke · Gele · Damask — luxury woven into every thread",
                        ctaText: "Shop Fabrics",
                        ctaLink: "/shop",
                        secondaryCtaText: "Our Heritage",
                        secondaryCtaLink: "/about",
                        image: "",
                        visible: true,
                    },
                },
            },
            { upsert: true },
        );

        await SiteSetting.updateOne(
            { key: "banners" },
            {
                $set: {
                    value: [
                        {
                            title: "New Arrivals — Ankara & Brocade",
                            subtitle: "Fresh prints landed this week",
                            link: "/shop",
                            ctaText: "Explore",
                            active: true,
                            sortOrder: 0,
                        },
                        {
                            title: "Wedding Season Offer",
                            subtitle: "Free Gele styling consultation with every bridal order",
                            link: "/shop?category=lace",
                            ctaText: "Shop Bridal",
                            active: true,
                            sortOrder: 1,
                        },
                    ],
                },
            },
            { upsert: true },
        );

        return NextResponse.json({
            message: "Database seeded successfully",
            products: productDefs.length,
            categories: categoryDefs.length,
            adminConfigured: Boolean(adminPassword),
        });
    } catch (e) {
        console.error("[seed] failed", e);
        return NextResponse.json(
            {
                error: "Seed failed",
                details:
                    process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: 500 },
        );
    }
}