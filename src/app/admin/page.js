"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchStats() {
            try {
                const token = localStorage.getItem("admin_token");
                const res = await fetch("/api/analytics/summary?days=30", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200/50 rounded-glass-sm animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-24 bg-gray-200/50 rounded-glass-lg animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    const totals = stats?.totals || {};

    const statCards = [
        {
            label: "Total Events",
            value: totals.totalEvents ?? 0,
            icon: "📊",
            color: "text-blue-600",
        },
        {
            label: "Page Views",
            value: totals.pageViews ?? 0,
            icon: "👁️",
            color: "text-emerald-600",
        },
        {
            label: "Product Views",
            value: totals.productViews ?? 0,
            icon: "🧵",
            color: "text-gold-600",
        },
        {
            label: "WhatsApp Clicks",
            value: totals.whatsappClicks ?? 0,
            icon: "💬",
            color: "text-burgundy-600",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-charcoal">
                        Dashboard
                    </h1>
                    <p className="text-sm text-soft-grey mt-1">
                        Overview of your store performance (last 30 days)
                    </p>
                </div>
                <Link
                    href="/admin/products"
                    className="glass-button-gold text-sm"
                >
                    Manage Products
                </Link>
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-glass-sm px-4 py-2">
                    {error}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl">{card.icon}</div>
                            <div className={`text-2xl font-bold ${card.color}`}>
                                {card.value.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-sm text-soft-grey mt-2">
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-6">
                <h2 className="text-lg font-semibold text-charcoal">
                    Quick Actions
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                        href="/admin/products"
                        className="glass-button-ghost justify-center text-sm"
                    >
                        View All Products
                    </Link>
                    <Link
                        href="/admin/products/new"
                        className="glass-button-gold justify-center text-sm"
                    >
                        Add New Product
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="glass-button-ghost justify-center text-sm"
                    >
                        View Analytics
                    </Link>
                </div>
            </div>
        </div>
    );
}
