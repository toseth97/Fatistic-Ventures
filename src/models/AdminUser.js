import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        hashedPassword: { type: String, required: true },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: { type: String, default: "admin", enum: ["admin", "user"] },
    },
    { timestamps: true },
);

export default mongoose.models.AdminUser ||
    mongoose.model("AdminUser", adminUserSchema);
