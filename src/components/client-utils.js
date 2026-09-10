"use client";

// Client-side helpers shared by storefront components.

const CART_ID_KEY = "fatistic_cart_id";

export function getGuestCartId() {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(CART_ID_KEY);
    if (!id) {
        id = `g${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(CART_ID_KEY, id);
    }
    return id;
}

export function clearGuestCartId() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CART_ID_KEY);
}

// Headers used for cart-bearing requests (public, no secrets).
export function cartHeaders(extra = {}) {
    const headers = { ...extra };
    const id = typeof window !== "undefined" ? getGuestCartId() : null;
    if (id) headers["x-cart-id"] = id;
    return headers;
}

export function serializeCartForClient(cart) {
    return cart || {
        _id: null,
        items: [],
        subtotal: 0,
        totalQuantity: 0,
        itemCount: 0,
        countItems: 0,
        staleItems: [],
    };
}

// Convert string amount (naira) to a Number safely.
export function toNaira(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}