import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, trim: true },
        publicId: { type: String, default: "", trim: true },
    },
    { _id: false },
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        slug: { type: String, trim: true, unique: true, sparse: true, index: true },
        description: { type: String, default: "" },
        price: { type: Number, required: true, min: 0, index: true },
        compareAtPrice: { type: Number, min: 0, default: null },
        quantity: { type: Number, default: 0, min: 0, index: true },
        category: {
            type: String,
            trim: true,
            default: "Other",
            required: true,
            index: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        images: { type: [imageSchema], default: [] },
        inStock: { type: Boolean, default: true, index: true },
        featured: { type: Boolean, default: false, index: true },
        published: { type: Boolean, default: true, index: true },
        viewCount: { type: Number, default: 0 },
        whatsappClickCount: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: true, updatedAt: true } },
);

productSchema.index({ category: 1, published: 1, featured: 1 });
productSchema.index({ price: 1, published: 1 });

function slugify(input) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

// Auto-generate a slug when one isn't provided.
productSchema.pre("validate", async function ensureSlug(next) {
    if (this.slug) {
        this.slug = slugify(this.slug);
        return next();
    }
    if (!this.name) return next();
    let base = slugify(this.name);
    if (!base) base = "product";
    let candidate = base;
    let n = 2;
    const Model = this.constructor;
    let existing = await Model.findOne({ slug: candidate, _id: { $ne: this._id } });
    while (existing) {
        candidate = `${base}-${n}`;
        n += 1;
        existing = await Model.findOne({ slug: candidate, _id: { $ne: this._id } });
    }
    this.slug = candidate;
    next();
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);
