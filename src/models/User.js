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
    },
    { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
