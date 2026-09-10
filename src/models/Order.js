import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: { type: String, required: true, trim: true },
        image: { type: String, default: "" },
        unitPrice: { type: Number, required: true, min: 0 }, // price snapshot at purchase
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true, min: 0 },
    },
    { _id: false },
);

const shippingSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true, default: "Nigeria" },
        notes: { type: String, default: "" },
    },
    { _id: false },
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true, unique: true, trim: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        email: { type: String, required: true, trim: true, lowercase: true, index: true },
        items: { type: [orderItemSchema], default: [] },
        shipping: { type: shippingSchema, default: () => ({}) },
        subtotal: { type: Number, required: true, min: 0 },
        deliveryFee: { type: Number, default: 0, min: 0 },
        total: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "NGN" },
        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
            ],
            default: "Pending",
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending",
            index: true,
        },
        paymentMethod: {
            type: String,
            enum: ["paystack", "bank_transfer", "pay_on_delivery", "whatsapp"],
            default: "pay_on_delivery",
        },
        paymentProviderRef: { type: String, default: "" },
        statusHistory: {
            type: [
                {
                    status: String,
                    note: { type: String, default: "" },
                    at: { type: Date, default: Date.now },
                    byName: { type: String, default: "" },
                },
            ],
            default: [],
        },
        notes: { type: String, default: "" },
    },
    { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);