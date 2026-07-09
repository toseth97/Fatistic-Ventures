import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        picture: {
            type: String,
            default: "",
            trim: true,
        },
        locale: {
            type: String,
            default: "",
            trim: true,
        },
        authType: {
            type: String,
            enum: ["google", "local"],
            default: "google",
        },
        provider: {
            type: String,
            default: "google",
            trim: true,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
