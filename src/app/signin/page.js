"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.6z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24z"
            />
            <path
                fill="#FBBC05"
                d="M5.2 14.4c-.3-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4l-3.9-3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3z"
            />
            <path
                fill="#EA4335"
                d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.9 3c.9-2.9 3.6-4.9 6.8-4.9z"
            />
        </svg>
    );
}

export default function SignInPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [callbackUrl, setCallbackUrl] = useState("/account");
    const [signingIn, setSigningIn] = useState(false);

    // Allow ?redirect=/checkout style callbacks (same-origin only).
    useEffect(() => {
        if (typeof window === "undefined") return;
        const target = new URLSearchParams(window.location.search).get("redirect");
        if (target && target.startsWith("/") && !target.startsWith("//")) {
            setCallbackUrl(target);
        }
    }, []);

    // Already signed in — go straight to the account page.
    useEffect(() => {
        if (status === "authenticated") router.replace(callbackUrl);
    }, [status, router, callbackUrl]);

    return (
        <main className="shell flex min-h-[70vh] items-center justify-center py-14">
            <div className="card w-full max-w-md rounded-3xl p-8 sm:p-10">
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <span className="font-display text-3xl font-bold text-ink">
                            Fatistic<span className="text-brand">.</span>
                        </span>
                    </Link>
                    <h1 className="mt-5 font-display text-2xl font-bold text-ink">Welcome back</h1>
                    <p className="mt-2 text-sm text-soft-grey">
                        Sign in to shop, save your cart and track your orders.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSigningIn(true);
                        signIn("google", { callbackUrl });
                    }}
                    disabled={signingIn || status === "loading"}
                    className="btn btn-outline btn-block btn-lg mt-7"
                >
                    <GoogleIcon />
                    {signingIn ? "Redirecting to Google…" : "Continue with Google"}
                </button>

                <ul className="mt-6 space-y-2 text-xs text-soft-grey">
                    <li className="flex items-center gap-2">
                        <span className="text-success">✓</span> We use Google&apos;s secure sign-in — we never see your password.
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-success">✓</span> Your cart follows you across devices.
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-success">✓</span> Track every order in one place.
                    </li>
                </ul>

                <div className="mt-7 border-t border-border pt-5 text-center">
                    <Link href="/shop" className="text-sm font-medium text-brand hover:underline">
                        ← Continue shopping as a guest
                    </Link>
                </div>
            </div>
        </main>
    );
}
