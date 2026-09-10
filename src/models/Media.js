import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, trim: true },
        publicId: { type: String, required: true, trim: true, unique: true },
        format: {
            type: String,
            enum: ["jpg", "jpeg", "png", "webp"],
            default: "jpg",
        },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        bytes: { type: Number, default: 0 },
        purpose: {
            type: String,
            enum: ["product", "category", "banner", "hero", "site", "other"],
            default: "other",
        },
        uploadedBy: { type: String, default: "admin" },
    },
    { timestamps: true },
);

mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ purpose: 1, createdAt: -1 });

export default mongoose.models.Media || mongoose.model("Media", mediaSchema);