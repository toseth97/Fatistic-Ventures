import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import {
    readCart,
    addToCart,
    clearCart,
    mergeGuestCart,
    cartKey,
} from "@/lib/cart";
import { cartAddSchema, unpack } from "@/lib/validation";
import { requireSameOrigin, jsonError } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const GUEST_ID_MAX = 120;

function getGuestId(req) {
    const raw = (req.headers.get("x-cart-id") || "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, GUEST_ID_MAX);
    return raw;
}

function cartScopes(req) {
    return { guestId: getGuestId(req) };
}

function isTruthy(value) {
    return value === "true" || value === "1" || value === true;
}

export async function GET(req) {
    try {
        const session = await auth();
        const userId = session?.user?.id || "";
        const { guestId } = cartScopes(req);
        const cart = await readCart({
            userId,
            guestId: userId ? "" : guestId,
        });
        return NextResponse.json({ cart, userScoped: !!userId });
    } catch (e) {
        console.error("[cart] GET error", e);
        return jsonError("Something went wrong. Please try again.", 500);
    }
}

export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const ip = clientIp(req);
        const limiter = rateLimit(`cart:post:${ip}`, 120, 60_000);
        if (!limiter.ok) {
            return NextResponse.json(
                { error: "Too many requests. Please try again shortly." },
                { status: 429 },
            );
        }

        const session = await auth();
        const userId = session?.user?.id || "";
        const { guestId } = cartScopes(req);

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(cartAddSchema, body);

        const cart = await addToCart({
            userId: userId || "",
            guestId: userId ? "" : guestId,
            productId: parsed.productId,
            quantity: parsed.quantity,
        });

        return NextResponse.json({ cart, userScoped: !!userId });
    } catch (e) {
        console.error("[cart] POST error", e);
        return NextResponse.json(
            {
                error: e?.message || "Failed to update cart",
                details:
                    process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: e?.status || 400 },
        );
    }
}

export async function DELETE(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const session = await auth();
        const userId = session?.user?.id || "";
        const { guestId } = cartScopes(req);

        const cart = await clearCart({
            userId: userId || "",
            guestId: userId ? "" : guestId,
        });
        return NextResponse.json({ cart, userScoped: !!userId });
    } catch (e) {
        console.error("[cart] DELETE error", e);
        return NextResponse.json({ error: "Failed to clear cart" }, { status: 400 });
    }
}