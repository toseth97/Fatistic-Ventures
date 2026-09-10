"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatNaira(v) {
    return "₦" + Math.round(Number(v || 0)).toLocaleString("en-NG");
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        async function fetchStats() {
            try {
                const token = localStorage.getItem("admin_token");
                const res = await fetch("/api/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!alive) return;
                if (!res.ok) throw new Error(data.error || "Failed to load stats");
                setStats(data);
            } catch (err) {
                if (alive) setError(err.message);
            } finally {
                if (alive) setLoading(false);
            }
        }
        fetchStats();
        return () => {
            alive = false;
        };
    }, []);

    const cards = stats
        ? [
              { label: "Revenue (paid)", value: formatNaira(stats.revenue), sub: `${stats.paidOrders} paid order(s)`, tone: "text-emerald-600" },
              { label: "Orders", value: stats.orders, sub: `${stats.ordersPending} pending`, tone: "text-brand" },
              { label: "Products", value: stats.products, sub: `${stats.categories} categories`, tone: "text-ink" },
              { label: "Customers", value: stats.users, sub: "registered via Google", tone: "text-info" },
          ]
        : [];

    const quickLinks = [
        { href: "/admin/products/new", label: "Add a product", icon: "➕" },
        { href: "/admin/orders", label: "Manage orders", icon: "📦" },
        { href: "/admin/content", label: "Edit homepage content", icon: "🎨" },
        { href: "/admin/categories", label: "Manage categories", icon: "📂" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-charcoal">Dashboard</h1>
                    <p className="mt-1 text-sm text-soft-grey">
                        Store performance at a glance
                    </p>
                </div>
                <Link href="/admin/products/new" className="glass-button-gold text-sm">
                    + Add Product
                </Link>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200/60" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cards.map((c) => (
                            <div key={c.label} className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-sm">
                                <p className="text-sm text-soft-grey">{c.label}</p>
                                <p className={`mt-2 text-2xl font-bold ${c.tone}`}>{c.value}</p>
                                <p className="mt-1 text-xs text-soft-grey">{c.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Status pipeline */}
                    <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-charcoal">Order pipeline</h2>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                            {[
                                ["Pending", stats.ordersPending],
                                ["Confirmed/Processing", stats.ordersProcessing],
                                ["Shipped", stats.ordersShipped],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-gray-50 p-3 text-center">
                                    <p className="text-xl font-bold text-charcoal">{value}</p>
                                    <p className="mt-0.5 text-[11px] text-soft-grey">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-charcoal">Quick actions</h2>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {quickLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="flex items-center gap-3 rounded-xl border border-gray-200/70 px-4 py-3 text-sm font-medium text-charcoal transition-colors hover:border-amber-300 hover:bg-amber-50/50"
                                >
                                    <span aria-hidden="true">{l.icon}</span> {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
