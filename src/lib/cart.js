import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// ---------------------------------------------------------------------------
// Server-side cart service.
// Prices are ALWAYS recomputed from the live Product document when reading the
// cart. The browser can never dictate a price or a total.
// ---------------------------------------------------------------------------

export function cartKey({ userId, guestId }) {
    if (userId && guestId) throw new Error("Cart owner ambiguity");
    if (userId) return { user: userId };
    if (guestId) return { guestId: String(guestId).slice(0, 120) };
    throw new Error("Cart owner required");
}

export async function getOrCreateCart({ userId, guestId }) {
    await connectDB();
    const query = cartKey({ userId, guestId });
    const cart = await Cart.findOne(query);
    if (cart) return cart;
    return Cart.create({ ...query, items: [] });
}

export function isAvailable(product) {
    return !!product && product.published !== false && product.inStock !== false;
}

export function availableQuantity(product) {
    if (!product) return 0;
    if (product.inStock === false) return 0;
    const q = Number(product.quantity) || 0;
    return q > 0 ? q : 0;
}

/**
 * Returns the full populated cart with live totals.
 * Each line: { productId, _id, quantity, name, image, unitPrice, subtotal,
 *              available, availableQuantity, priceChanged }
 */
export async function readCart({ userId, guestId }) {
    await connectDB();
    const query = cartKey({ userId, guestId });
    const cart = await Cart.findOne(query).lean();

    if (!cart) {
        return emptyCartPublic();
    }

    const productIds = (cart.items || []).map((i) => i.product).filter(Boolean);
    const products = productIds.length
        ? await Product.find({ _id: { $in: productIds } }).lean()
        : [];

    const byId = new Map(products.map((p) => [String(p._id), p]));
    const items = [];
    let subtotal = 0;
    let totalQuantity = 0;

    for (const line of cart.items || []) {
        const product = byId.get(String(line.product));
        const unitPrice = product ? Number(product.price) || 0 : 0;
        const maxQty = product ? availableQuantity(product) : 0;
        const quantity = Math.min(Math.max(1, Number(line.quantity) || 1), 1000);
        const available = isAvailable(product);

        // If a product's price changed since it was added, flag it.
        const priceChanged =
            product &&
            line.priceSnapshot != null &&
            Number(line.priceSnapshot) !== unitPrice;

        const itemSubtotal = unitPrice * quantity;
        subtotal += itemSubtotal;
        totalQuantity += quantity;

        items.push({
            _id: String(line._id),
            productId: String(line.product),
            name: product?.name || line.nameSnapshot || "Product",
            image: product?.images?.[0]?.url || line.imageSnapshot || "",
            unitPrice,
            quantity,
            subtotal: itemSubtotal,
            available,
            availableQuantity: maxQty,
            requestedQuantity: Number(line.quantity) || 1,
            priceChanged,
            slug: product?.slug || "",
            published: product ? product.published !== false : false,
            inStock: product ? product.inStock !== false : false,
        });
    }

    return {
        _id: String(cart._id),
        items,
        subtotal,
        totalQuantity,
        itemCount: items.length,
        countItems: totalQuantity,
        staleItems: items.filter((i) => !i.available || i.priceChanged),
    };
}

/**
 * Add or increment a product in the cart.
 * Validates that the product exists, is published + in stock, and that the
 * requested quantity does not exceed inventory.
 */
export async function addToCart({ userId, guestId, productId, quantity }) {
    await connectDB();
    const product = await Product.findById(productId).lean();
    if (!product) {
        const err = new Error("Product not found");
        err.status = 404;
        throw err;
    }
    if (product.published === false) {
        const err = new Error("This product is no longer available");
        err.status = 400;
        throw err;
    }
    const maxQty = availableQuantity(product);
    if (maxQty <= 0) {
        const err = new Error("This product is currently out of stock");
        err.status = 400;
        throw err;
    }
    if (quantity > maxQty) {
        const err = new Error(`Only ${maxQty} unit(s) available in stock`);
        err.status = 400;
        throw err;
    }

    const cart = await getOrCreateCart({ userId, guestId });
    const existing = cart.items.find((i) => String(i.product) === String(productId));

    const newQty = (existing ? Number(existing.quantity) : 0) + quantity;
    if (newQty > maxQty) {
        const err = new Error(`Only ${maxQty} unit(s) available in stock`);
        err.status = 400;
        throw err;
    }

    if (existing) {
        existing.quantity = newQty;
        existing.priceSnapshot = product.price;
        existing.nameSnapshot = product.name;
        existing.imageSnapshot = product.images?.[0]?.url || "";
    } else {
        cart.items.push({
            product: productId,
            quantity,
            priceSnapshot: product.price,
            nameSnapshot: product.name,
            imageSnapshot: product.images?.[0]?.url || "",
        });
    }

    await cart.save();
    return readCart({ userId, guestId });
}

export async function updateCartItem({ userId, guestId, itemIndex, quantity }) {
    await connectDB();
    const cart = await getOrCreateCart({ userId, guestId });
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
        const err = new Error("Cart item not found");
        err.status = 404;
        throw err;
    }
    const line = cart.items[itemIndex];
    const product = await Product.findById(line.product).lean();
    if (!product) {
        const err = new Error("Product not found");
        err.status = 404;
        throw err;
    }

    if (quantity <= 0) {
        // remove the item
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return readCart({ userId, guestId });
    }

    const maxQty = availableQuantity(product);
    if (maxQty <= 0 || quantity > maxQty) {
        const err = new Error(
            maxQty <= 0
                ? "This product is currently out of stock"
                : `Only ${maxQty} unit(s) available in stock`,
        );
        err.status = 400;
        throw err;
    }

    line.quantity = quantity;
    line.priceSnapshot = product.price;
    line.nameSnapshot = product.name;
    line.imageSnapshot = product.images?.[0]?.url || "";
    cart.markModified("items");
    await cart.save();
    return readCart({ userId, guestId });
}

export async function removeCartItem({ userId, guestId, itemIndex }) {
    await connectDB();
    const cart = await getOrCreateCart({ userId, guestId });
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
        throw Object.assign(new Error("Cart item not found"), { status: 404 });
    }
    cart.items.splice(itemIndex, 1);
    await cart.save();
    return readCart({ userId, guestId });
}

export async function clearCart({ userId, guestId }) {
    await connectDB();
    const cart = await getOrCreateCart({ userId, guestId });
    cart.items = [];
    await cart.save();
    return readCart({ userId, guestId });
}

// Merge a guest cart into a user cart after sign-in.
export async function mergeGuestCart({ userId, guestId }) {
    if (!userId || !guestId) return;
    await connectDB();
    const guestCart = await Cart.findOne({ guestId }).lean();
    const userCart = await getOrCreateCart({ userId });

    if (!guestCart?.items?.length) return;

    for (const guestItem of guestCart.items) {
        const existing = userCart.items.find(
            (i) => String(i.product.toString()) === String(guestItem.product.toString()),
        );
        const product = await Product.findById(guestItem.product).lean();
        const maxQty = product ? availableQuantity(product) : 0;
        if (!product || product.published === false || maxQty <= 0) continue;

        if (existing) {
            existing.quantity = Math.min(existing.quantity + guestItem.quantity, maxQty);
        } else {
            userCart.items.push({
                product: guestItem.product,
                quantity: Math.min(guestItem.quantity, maxQty),
                priceSnapshot: product.price,
                nameSnapshot: product.name,
                imageSnapshot: product.images?.[0]?.url || "",
            });
        }
    }
    userCart.markModified("items");
    await userCart.save();
    // Guest cart is cleared after a successful merge to avoid duplication.
    await Cart.deleteOne({ guestId });
}
export function emptyCartPublic() {
    return {
        cartId: null,
        items: [],
        subtotal: 0,
        totalQuantity: 0,
        itemCount: 0,
        countItems: 0,
        staleItems: [],
    };
}