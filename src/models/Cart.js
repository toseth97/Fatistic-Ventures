import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: { type: Number, required: true, min: 1, max: 1000 },
        // Price snapshot is informational only; totals are always recomputed
        // from the live Product document in the cart service.
        priceSnapshot: { type: Number, default: null },
        nameSnapshot: { type: String, default: "" },
        imageSnapshot: { type: String, default: "" },
    },
    { _id: true },
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        guestId: { type: String, trim: true, default: "", index: true },
        items: { type: [cartItemSchema], default: [] },
        // chosen shipping option / state (optional)
        meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true },
);

cartSchema.index({ user: 1, guestId: 1 });

// Enforce that exactly one of user/guestId owns the cart.
cartSchema.pre("save", function validateOwner(next) {
    if ((!this.user && !this.guestId) || (this.user && this.guestId)) {
        return next(new Error("A cart must have exactly one owner (user or guest)"));
    }
    return next();
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);