import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        orderNumber: { type: String, trim: true, index: true },
        provider: {
            type: String,
            enum: ["paystack", "flutterwave", "bank_transfer", "pay_on_delivery", "whatsapp"],
            required: true,
        },
        reference: { type: String, trim: true, unique: true, sparse: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "NGN" },
        status: {
            type: String,
            enum: ["pending", "success", "failed", "cancelled", "refunded"],
            default: "pending",
            index: true,
        },
        // Minimal non-sensitive metadata only. NEVER store card details/CVVs/pins.
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        verifiedAt: { type: Date, default: null },
        rawWebhookPartial: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true },
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);