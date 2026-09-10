import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { readCart, mergeGuestCart } from "@/lib/cart";
import { requireSameOrigin } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rateLimit";

function getGuestId(req) {
    return (req.headers.get("x-cart-id") || "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 120);
}

// Transfers a guest cart into the signed-in user's cart after Google sign-in.
export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const limiter = rateLimit(`cart:transfer:${clientIp(req)}`, 10, 60_000);
        if (!limiter.ok) {
            return NextResponse.json(
                { error: "Too many requests. Please try again shortly." },
                { status: 429 },
            );
        }

        const session = await auth();
        const userId = session?.user?.id || "";
        if (!userId) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const guestId = getGuestId(req);
        if (!guestId) {
            return NextResponse.json({ error: "No guest cart to transfer" }, { status: 400 });
        }

        await mergeGuestCart({ userId, guestId });
        const cart = await readCart({ userId });
        return NextResponse.json({ cart, userScoped: true });
    } catch (e) {
        console.error("[cart] transfer error", e);
        return NextResponse.json(
            { error: "Could not transfer your cart. Please try again." },
            { status: 500 },
        );
    }
}