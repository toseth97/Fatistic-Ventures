import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
        category: {
            type: String,
            enum: ["Aso-Oke", "Gele", "Damask", "Other"],
            default: "Other",
            required: true,
        },
        images: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
            },
        ],
        inStock: { type: Boolean, default: true },
        viewCount: { type: Number, default: 0 },
        whatsappClickCount: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: true, updatedAt: true } },
);

export default mongoose.models.Product ||
    mongoose.model("Product", productSchema);
