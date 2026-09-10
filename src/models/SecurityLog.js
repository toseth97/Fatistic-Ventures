import mongoose from "mongoose";

// Security-relevant audit log. Destination values are redacted-by-design:
// we record actors and actions, never passwords, tokens or payment details.
const securityLogSchema = new mongoose.Schema(
    {
        actor: { type: String, default: "anonymous", trim: true, index: true },
        actorRole: { type: String, default: "", trim: true },
        action: { type: String, required: true, index: true },
        category: {
            type: String,
            enum: ["auth", "admin", "product", "category", "order", "upload", "security", "payment"],
            default: "security",
            index: true,
        },
        targetId: { type: String, default: "" },
        ip: { type: String, default: "" },
        userAgent: { type: String, default: "" },
        outcome: { type: String, enum: ["success", "failed", "blocked"], default: "success" },
        detail: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90, index: true }, // 90-day retention
    },
    { timestamps: false },
);

securityLogSchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.SecurityLog ||
    mongoose.model("SecurityLog", securityLogSchema);