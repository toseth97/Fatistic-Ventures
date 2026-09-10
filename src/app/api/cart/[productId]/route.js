import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { readCart, getOrCreateCart, updateCartItem, removeCartItem } from "@/lib/cart";
import { cartUpdateSchema, unpack, objectIdSchema } from "@/lib/validation";
import { requireSameOrigin } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rateLimit";

function getGuestId(req) {
    return (req.headers.get("x-cart-id") || "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 120);
}

function findItemIndexByProduct(cart, productId) {
    return (cart?.items || []).findIndex((i) => String(i.product) === String(productId));
}

export async function PUT(req, { params }) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const limiter = rateLimit(`cart:put:${clientIp(req)}`, 120, 60_000);
        if (!limiter.ok) {
            return NextResponse.json(
                { error: "Too many requests. Please try again shortly." },
                { status: 429 },
            );
        }

        const productId = (await params)?.productId;
        if (!objectIdSchema.safeParse(productId).success) {
            return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
        }

        const session = await auth();
        const userId = session?.user?.id || "";
        const guestId = getGuestId(req);
        const cart = await getOrCreateCart({
            userId: userId || "",
            guestId: userId ? "" : guestId,
        });
        const index = findItemIndexByProduct(cart, productId);
        if (index < 0) {
            return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
        }

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(cartUpdateSchema, body);

        const updatedCart = await updateCartItem({
            userId: userId || "",
            guestId: userId ? "" : guestId,
            itemIndex: index,
            quantity: parsed.quantity,
        });
        return NextResponse.json({ cart: updatedCart, userScoped: !!userId });
    } catch (e) {
        console.error("[cart:item] PUT error", e);
        return NextResponse.json(
            {
                error: e?.message || "Could not update cart",
                details:
                    process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: e?.status || 400 },
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const productId = (await params)?.productId;
        if (!objectIdSchema.safeParse(productId).success) {
            return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
        }

        const session = await auth();
        const userId = session?.user?.id || "";
        const guestId = getGuestId(req);
        const cart = await getOrCreateCart({
            userId: userId || "",
            guestId: userId ? "" : guestId,
        });
        const index = findItemIndexByProduct(cart, productId);
        if (index < 0) {
            return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
        }

        const updatedCart = await removeCartItem({
            userId: userId || "",
            guestId: userId ? "" : guestId,
            itemIndex: index,
        });
        return NextResponse.json({ cart: updatedCart, userScoped: !!userId });
    } catch (e) {
        console.error("[cart:item] DELETE error", e);
        return NextResponse.json({ error: "Could not remove item" }, { status: 400 });
    }
}