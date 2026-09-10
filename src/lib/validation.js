import { z } from "zod";

// ---------------------------------------------------------------------------
// Server-side validation schemas. The server never trusts the browser; every
// mutation is validated here. Descriptions are constrained to plain text.
// ---------------------------------------------------------------------------

export const objectIdSchema = z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const nameSchema = z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(160, "Name must be under 160 characters");

export const descriptionSchema = z
    .string()
    .trim()
    .max(5000, "Description must be under 5000 characters")
    .default("");

export const priceSchema = z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative")
    .max(100_000_000, "Price is too large");

export const quantitySchema = z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(1_000_000, "Quantity is too large");

export const imageSchema = z.object({
    url: z
        .string()
        .trim()
        .url("Image URL is invalid")
        .max(1000, "Image URL too long"),
    publicId: z
        .string()
        .trim()
        .max(500, "publicId too long")
        .optional()
        .default(""),
});

export const productSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
    price: priceSchema,
    quantity: quantitySchema.default(0),
    category: z.string().trim().min(1, "Category is required").max(80),
    categoryId: objectIdSchema.optional().nullable(),
    images: z.array(imageSchema).max(12, "Too many images").default([]),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    compareAtPrice: priceSchema.optional().nullable(),
});

export const categoryCreateSchema = z.object({
    name: nameSchema,
    displayName: nameSchema,
    description: descriptionSchema.default(""),
    image: imageSchema.optional().nullable(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const cartAddSchema = z.object({
    productId: objectIdSchema,
    quantity: z
        .number()
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1")
        .max(1000, "Quantity is too large"),
});

export const cartUpdateSchema = z.object({
    quantity: z
        .number()
        .int("Quantity must be a whole number")
        .min(0, "Quantity cannot be negative")
        .max(1000, "Quantity is too large"),
});

export const addressSchema = z.object({
    fullName: nameSchema.max(120),
    phone: z
        .string()
        .trim()
        .min(7, "A valid phone number is required")
        .max(24, "Phone number too long")
        .regex(/^[+0-9()\-\s]+$/, "Phone number contains invalid characters"),
    email: z.string().trim().email("A valid email is required").max(160),
    address: z.string().trim().min(5, "Delivery address is required").max(300),
    city: z.string().trim().min(1, "City is required").max(120),
    state: z.string().trim().min(1, "State/Region is required").max(120),
    country: z.string().trim().min(1, "Country is required").max(120).default("Nigeria"),
    notes: z.string().trim().max(1000).optional().default(""),
});

export const orderCreateSchema = z.object({
    shipping: addressSchema,
    paymentMethod: z.enum(["paystack", "bank_transfer", "pay_on_delivery", "whatsapp"]).default("pay_on_delivery"),
});

export const loginSchema = z.object({
    username: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().max(160).optional(),
    password: z.string().min(1, "Password is required").max(128),
});

export const profileUpdateSchema = z.object({
    name: nameSchema.max(120).optional(),
    phone: z.string().trim().min(7).max(24).optional().or(z.literal("")),
    address: z.string().trim().max(300).optional().or(z.literal("")),
});

export const settingsSchema = z.record(z.string(), z.any());

export const bannerSchema = z.object({
    title: z.string().trim().min(1).max(160),
    subtitle: z.string().trim().max(300).default(""),
    image: imageSchema.nullable().optional(),
    link: z.string().trim().max(500).default(""),
    ctaText: z.string().trim().max(60).default("Shop Now"),
    active: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(100000).default(0),
});

export const unpack = (schema, data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
        const first = result.error.issues[0];
        const message = first
            ? `${first.path.join(".") || "field"}: ${first.message}`
            : "Invalid input";
        const err = new Error(message);
        err.validation = true;
        throw err;
    }
    return result.data;
};