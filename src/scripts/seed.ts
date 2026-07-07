import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fatistic";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  // Import models
  const Product = require("../models/Product").default || require("../models/Product");
  const AdminUser = require("../models/AdminUser").default || require("../models/AdminUser");

  // Clear existing data
  await Promise.all([
    Product.deleteMany({}),
    AdminUser.deleteMany({}),
  ]);
  console.log("Cleared existing data.");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await AdminUser.create({
    email: "admin@fatistic.com",
    hashedPassword,
    role: "admin",
  });
  console.log("Created admin user: admin@fatistic.com / admin123");

  // Create sample products
  const products = [
    {
      name: "Premium Aso-Oke Blue",
      description:
        "Handwoven premium Aso-Oke fabric in deep blue with subtle gold threads. Perfect for traditional ceremonies, weddings, and special occasions. Each piece is uniquely crafted by skilled artisans.",
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
        "Exquisite royal Aso-Oke with intricate gold patterns on a rich burgundy base. A statement piece for the discerning gentleman or lady.",
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
        "Beautifully structured Gele headwrap in soft pink. Pre-tied and ready to wear, with a luxurious finish that holds its shape all day.",
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
        "Timeless white Gele headwrap, perfect for weddings and church events. Made from high-quality stiffened fabric for a flawless drape.",
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
        "Premium Damask fabric in rich emerald green with a subtle woven pattern. Ideal for agbada, kaftans, and elegant evening wear.",
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
        "Opulent gold Damask brocade with intricate floral patterns. A luxurious choice for the most special celebrations.",
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
  console.log(`Created ${products.length} sample products.`);

  await mongoose.disconnect();
  console.log("Seed complete. Disconnected.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});