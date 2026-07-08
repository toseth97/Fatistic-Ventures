import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        displayName: { type: String, required: true, trim: true },
        createdBy: { type: String, default: "admin" },
    },
    { timestamps: true },
);

export default mongoose.models.Category ||
    mongoose.model("Category", categorySchema);
