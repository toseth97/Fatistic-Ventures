"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const t = localStorage.getItem("admin_token");
        if (!t && pathname !== "/admin/login") {
            router.push("/admin/login");
        } else {
            setToken(t);
        }
    }, [pathname, router]);

    // Don't apply admin layout to login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (!mounted || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-soft-grey">Loading...</div>
            </div>
        );
    }

    const navLinks = [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/products", label: "Products", icon: "🧵" },
        { href: "/admin/categories", label: "Categories", icon: "📂" },
        { href: "/admin/analytics", label: "Analytics", icon: "📈" },
    ];

    function handleLogout() {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Admin sidebar + header */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-64 min-h-screen backdrop-blur-xl bg-white/80 border-r border-gray-200/50 shadow-sm">
                    <div className="p-6 border-b border-gray-200/50">
                        <Link
                            href="/admin"
                            className="font-display text-lg font-semibold text-charcoal"
                        >
                            Fatistic<span className="text-gold-600">.</span>{" "}
                            <span className="text-xs text-soft-grey font-sans font-normal">
                                Admin
                            </span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-glass-sm text-sm font-medium transition-all ${
                                    pathname === link.href
                                        ? "bg-gold-500/10 text-gold-700"
                                        : "text-gray-600 hover:text-charcoal hover:bg-white/60"
                                }`}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200/50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-glass-sm text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 w-full transition-all"
                        >
                            <span>🚪</span>
                            Logout
                        </button>
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-glass-sm text-sm font-medium text-gray-600 hover:text-charcoal hover:bg-white/60 w-full transition-all mt-1"
                        >
                            <span>←</span>
                            Back to Store
                        </Link>
                    </div>
                </aside>

                {/* Mobile header */}
                <div className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
                    <div className="flex items-center justify-between px-4 h-14">
                        <Link
                            href="/admin"
                            className="font-display text-lg font-semibold text-charcoal"
                        >
                            Fatistic<span className="text-gold-600">.</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/"
                                className="text-xs text-soft-grey hover:text-charcoal"
                            >
                                Store
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-red-500 hover:text-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <main className="flex-1 md:pl-0 pt-14 md:pt-0">
                    <div className="max-w-6xl mx-auto p-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
