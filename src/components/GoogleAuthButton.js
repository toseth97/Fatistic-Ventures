"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fatistic_user_profile";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleAuthButton() {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    useEffect(() => {
        if (!CLIENT_ID || typeof window === "undefined") return;

        function initGoogle() {
            if (!window.google?.accounts?.id || ready) return;

            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                ux_mode: "popup",
            });
            setReady(true);
        }

        if (window.google?.accounts?.id) {
            initGoogle();
            return;
        }

        if (document.getElementById("google-signin-script")) {
            const timer = window.setInterval(() => {
                if (window.google?.accounts?.id) {
                    initGoogle();
                    window.clearInterval(timer);
                }
            }, 100);
            return () => window.clearInterval(timer);
        }

        const script = document.createElement("script");
        script.id = "google-signin-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle();
        document.body.appendChild(script);

        return () => {
            // keep the script if already loaded once
        };
    }, [ready]);

    async function handleCredentialResponse(response) {
        if (!response?.credential) {
            setError("Google sign-in failed. Please try again.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: response.credential }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(
                    data.error || "Unable to verify Google sign-in",
                );
            }

            const profile = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                picture: data.user.picture,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
            setUser(profile);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleSignIn() {
        if (!CLIENT_ID) {
            setError("Google client ID not configured.");
            return;
        }
        if (!ready || !window.google?.accounts?.id) {
            setError("Google sign-in is loading. Please wait a moment.");
            return;
        }
        setError("");
        window.google.accounts.id.prompt();
    }

    function handleSignOut() {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <img
                    src={user.picture}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-gray-200/70 object-cover"
                />
                <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-medium text-charcoal">
                        {user.name}
                    </span>
                    <span className="text-xs text-soft-grey">{user.email}</span>
                </div>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="glass-button-ghost text-sm px-3 py-2"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 items-end">
            <button
                type="button"
                onClick={handleSignIn}
                disabled={!CLIENT_ID || loading}
                className="glass-button-gold text-sm px-4 py-2"
            >
                {loading ? "Signing in..." : "Sign in with Google"}
            </button>
            {error ? (
                <span className="text-xs text-red-600">{error}</span>
            ) : null}
        </div>
    );
}
