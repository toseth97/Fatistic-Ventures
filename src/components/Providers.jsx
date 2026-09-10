"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/Toast";

// Client-side providers for the whole app.
export default function Providers({ children }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <CartProvider>{children}</CartProvider>
            </ToastProvider>
        </SessionProvider>
    );
}