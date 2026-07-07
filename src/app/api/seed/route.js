import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { requireAdmin } = await import("@/lib/middleware");
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;

        await connectDB();

        const Product = (await import("@/models/Product")).default;
        const AdminUser = (await import("@/models/AdminUser")).default;

        // Clear existing data
        await Promise.all([Product.deleteMany({}), AdminUser.deleteMany({})]);

        // Create admin user
        const hashedPassword = await bcrypt.hash("admin123", 12);
        await AdminUser.create({
            email: "admin@fatistic.com",
            hashedPassword,
            role: "admin",
        });

        // Create sample products
        const products = [
            {
                name: "Premium Aso-Oke Blue",
                description:
                    "Handwoven premium Aso-Oke fabric in deep blue with subtle gold threads. Perfect for traditional ceremonies, weddings, and special occasions.",
                price: 45000,
                category: "Aso-Oke",
                images: [
                    {
                        url: "https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/aso-oke-blue.jpg",
                        publicId: "sample_aso_oke_1",
                    },
                ],
                inStock: true,
            },
            {
                name: "Royal Aso-Oke Gold",
                description:
                    "Exquisite royal Aso-Oke with intricate gold patterns on a rich burgundy base.",
                price: 65000,
                category: "Aso-Oke",
                images: [
                    {
                        url: "https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/aso-oke-gold.jpg",
                        publicId: "sample_aso_oke_2",
                    },
                ],
                inStock: true,
            },
            {
                name: "Elegant Gele Pink",
                description:
                    "Beautifully structured Gele headwrap in soft pink. Pre-tied and ready to wear.",
                price: 15000,
                category: "Gele",
                images: [
                    {
                        url: "https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/gele-pink.jpg",
                        publicId: "sample_gele_1",
                    },
                ],
                inStock: true,
            },
            {
                name: "Classic Gele White",
                description:
                    "Timeless white Gele headwrap, perfect for weddings and church events.",
                price: 12000,
                category: "Gele",
                images: [
                    {
                        url: "https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/gele-white.jpg",
                        publicId: "sample_gele_2",
                    },
                ],
                inStock: true,
            },
            {
                name: "Luxury Damask Green",
                description:
                    "Premium Damask fabric in rich emerald green with a subtle woven pattern.",
                price: 35000,
                category: "Damask",
                images: [
                    {
                        url: "https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/damask-green.jpg",
                        publicId: "sample_damask_1",
                    },
                ],
                inStock: true,
            },
            {
                name: "Gold Damask Brocade",
                description:
                    "Opulent gold Damask brocade with intricate floral patterns.",
                price: 55000,
                category: "Damask",
                images: [
                    {
                        url: "https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/damask-gold.jpg",
                        publicId: "sample_damask_2",
                    },
                ],
                inStock: true,
            },
        ];

        await Product.insertMany(products);

        return NextResponse.json(
            {
                message: "Database seeded successfully",
                productsCreated: products.length,
                adminCreated: true,
            },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json(
            { error: "Seed failed", details: e?.message || String(e) },
            { status: 500 },
        );
    }
}
