"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import { useSession } from "next-auth/react";
import { getGuestCartId, cartHeaders } from "@/components/client-utils";

const CartContext = createContext({
    cart: null,
    loading: true,
    count: 0,
    refresh: async () => {},
    addToCart: async () => ({ added: false, error: "" }),
    updateQty: async () => {},
    removeItem: async () => {},
    clearCart: async () => {},
});

const EMPTY = {
    items: [],
    subtotal: 0,
    totalQuantity: 0,
    itemCount: 0,
    countItems: 0,
    staleItems: [],
};

export function CartProvider({ children }) {
    const [cart, setCart] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();
    const didMerge = useRef(false);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/cart", { headers: cartHeaders() });
            const data = await res.json();
            setCart(data.cart || EMPTY);
        } catch {
            setCart(EMPTY);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh, status === "authenticated"]);

    // After Google sign-in, merge the guest cart into the user's cart once.
    useEffect(() => {
        if (status !== "authenticated" || !session?.user?.id) return;
        if (didMerge.current) return;
        const guestId = getGuestCartId();
        if (!guestId) return;
        didMerge.current = true;
        fetch("/api/cart/transfer", {
            method: "POST",
            headers: {
                ...cartHeaders(),
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json().catch(() => ({})))
            .then((data) => {
                if (data.cart) setCart(data.cart);
            })
            .catch(() => {});
    }, [status, session?.user?.id]);

    const addToCart = useCallback(
        async (productId, quantity = 1) => {
            try {
                const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: {
                        ...cartHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productId, quantity }),
                });
                const data = await res.json();
                if (!res.ok) {
                    return { added: false, error: data.error || "Could not add to cart" };
                }
                setCart(data.cart || EMPTY);
                return { added: true, error: "" };
            } catch {
                return { added: false, error: "Something went wrong. Please try again." };
            }
        },
        [],
    );

    const updateQty = useCallback(async (productId, quantity) => {
        try {
            const res = await fetch(`/api/cart/${productId}`, {
                method: "PUT",
                headers: {
                    ...cartHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quantity }),
            });
            const data = await res.json();
            if (res.ok) setCart(data.cart || EMPTY);
            return { ok: res.ok, error: data.error || "" };
        } catch {
            return { ok: false, error: "Could not update cart" };
        }
    }, []);

    const removeItem = useCallback(async (productId) => {
        try {
            const res = await fetch(`/api/cart/${productId}`, {
                method: "DELETE",
                headers: cartHeaders(),
            });
            const data = await res.json();
            if (res.ok) setCart(data.cart || EMPTY);
            return { ok: res.ok };
        } catch {
            return { ok: false };
        }
    }, []);

    const clearCart = useCallback(async () => {
        try {
            const res = await fetch("/api/cart", {
                method: "DELETE",
                headers: cartHeaders(),
            });
            const data = await res.json();
            if (res.ok) setCart(data.cart || EMPTY);
        } catch {
            /* keep local state */
        }
    }, []);

    const count = cart?.countItems || 0;

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                count,
                refresh,
                addToCart,
                updateQty,
                removeItem,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}