"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("admin_token", data.token);
            router.push("/admin");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md backdrop-blur-md bg-white/70 border border-white/40 shadow-glass-lg rounded-glass-lg overflow-hidden">
                <div className="p-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30">
                            <span className="text-xl">✨</span>
                            <span className="font-display text-sm font-semibold text-gold-700">
                                Fatistic Ventures
                            </span>
                        </div>
                        <div className="font-display text-3xl font-semibold text-charcoal mt-4">
                            Admin Login
                        </div>
                        <p className="mt-2 text-sm text-soft-grey">
                            Manage products & categories
                        </p>

                        <div className="mt-3 text-xs text-soft-grey">
                            Demo credentials:{" "}
                            <span className="text-gold-700 font-semibold">
                                fatistic_admin
                            </span>{" "}
                            /{" "}
                            <span className="text-charcoal font-semibold">
                                FatisticAdmin$
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-glass-sm px-4 py-2">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-charcoal">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="glass-input mt-1 w-full"
                                placeholder="fatistic_admin"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal">
                                Password
                            </label>

                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="glass-input w-full pr-14"
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute top-1/2 -translate-y-1/2 right-2 text-xs px-3 py-1 rounded-full bg-white/70 border border-gray-200/70 text-charcoal hover:bg-white transition"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button-gold w-full"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        <p className="text-center text-[11px] text-soft-grey pt-1">
                            Secure admin access. Products you add here appear on
                            the shop.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
