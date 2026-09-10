import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Payment from "@/models/Payment";
import { readCart } from "@/lib/cart";

// Free delivery within Lagos by default; configurable by admin later.
export function computeDeliveryFee(cart, { city, state }) {
    return 0;
}

export function generateOrderNumber() {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
        now.getDate(),
    ).padStart(2, "0")}`;
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `FV-${ymd}-${rand}`;
}

export function generatePaymentReference(orderNumber) {
    return `FV${orderNumber.replace(/[^A-Z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}`;
}

const ORDER_STATUS_FLOW = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

/**
 * Create an order from the user's cart.
 * - Reads live prices from the DB (never the client).
 * - Rejects unavailable/inventory-exceeded items.
 * - Snapshots item prices into the order.
 * - Atomically decrements inventory.
 * - Clears the cart and records a pending Payment row.
 */
export async function createOrder({ userId, shipping, paymentMethod }) {
    await connectDB();
    const cartData = await readCart({ userId });

    if (!cartData.items.length) {
        throw Object.assign(new Error("Your cart is empty"), { status: 400 });
    }

    for (const item of cartData.items) {
        if (!item.available) {
            throw Object.assign(
                new Error(
                    `"${item.name}" is no longer available for purchase. Please review your cart.`,
                ),
                { status: 400 },
            );
        }
        if (item.quantity > item.availableQuantity) {
            throw Object.assign(
                new Error(
                    `Only ${item.availableQuantity} unit(s) of "${item.name}" are available.`,
                ),
                { status: 400 },
            );
        }
    }

    const subtotal = cartData.subtotal;
    const deliveryFee = computeDeliveryFee(cartData, shipping);
    const total = subtotal + deliveryFee;

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
        orderNumber,
        user: userId,
        email: shipping.email,
        items: cartData.items.map((item) => ({
            product: item.productId,
            name: item.name,
            image: item.image,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.unitPrice * item.quantity,
        })),
        shipping: {
            fullName: shipping.fullName,
            phone: shipping.phone,
            email: shipping.email,
            address: shipping.address,
            city: shipping.city,
            state: shipping.state,
            country: shipping.country,
            notes: shipping.notes || "",
        },
        subtotal,
        deliveryFee,
        total,
        currency: "NGN",
        status: "Pending",
        paymentStatus: "Pending",
        paymentMethod,
        statusHistory: [
            {
                status: "Pending",
                note: "Order created",
                at: new Date(),
            },
        ],
    });

    // Atomically decrement inventory. Only decrement rows that still have enough quantity.
    const cart = await Cart.findOne({ user: userId }).lean();
    const decrementOps = [];
    for (const item of cart?.items || []) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;
        decrementOps.push(
            Product.updateOne(
                { _id: item.product, quantity: { $gte: qty } },
                [{ $set: { quantity: { $max: [0, { $subtract: ["$quantity", qty] }] } } }]
            ),
        );
    }
    await Promise.all(decrementOps);

    // Remove the cart now that the order has officially reserved its inventory.
    await Cart.deleteOne({ user: userId });

    const payment = await Payment.create({
        order: order._id,
        orderNumber,
        provider: paymentMethod,
        amount: total,
        currency: "NGN",
        status: "pending",
        metadata: { initiatedBy: String(userId) },
    });

    return { order: order.toObject ? order.toObject() : order, payment };
}

export const PAYMENT_METHODS = ["paystack", "bank_transfer", "pay_on_delivery", "whatsapp"];