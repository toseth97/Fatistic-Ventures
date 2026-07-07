import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["page_view", "product_view", "whatsapp_click"],
            required: true,
        },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        timestamp: { type: Date, default: () => new Date() },
        meta: {
            referrer: { type: String, default: "" },
            device: { type: String, default: "" },
            userAgent: { type: String, default: "" },
            ip: { type: String, default: "" },
        },
    },
    { timestamps: false },
);

export default mongoose.models.AnalyticsEvent ||
    mongoose.model("AnalyticsEvent", analyticsEventSchema);
