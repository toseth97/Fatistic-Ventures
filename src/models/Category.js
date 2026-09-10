import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        slug: { type: String, trim: true, unique: true, sparse: true, index: true },
        displayName: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        image: {
            url: { type: String, default: "", trim: true },
            publicId: { type: String, default: "", trim: true },
        },
        published: { type: Boolean, default: true, index: true },
        featured: { type: Boolean, default: false, index: true },
        sortOrder: { type: Number, default: 0 },
        createdBy: { type: String, default: "admin" },
    },
    { timestamps: true },
);

function slugify(input) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

categorySchema.pre("validate", async function (next) {
    if (!this.slug) {
        let base = slugify(this.name || this.displayName);
        if (!base) base = "category";
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
    }
    next();
});

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
