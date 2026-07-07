"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

export default function AdminAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [days, setDays] = useState(14);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            try {
                const token = localStorage.getItem("admin_token");
                const res = await fetch(`/api/analytics/summary?days=${days}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, [days]);

    const COLORS = ["#E6B800", "#B83A64", "#10B981", "#6B7280", "#1A1A1A"];

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
                <div className="h-64 bg-gray-200/50 rounded-glass-lg animate-pulse" />
            </div>
        );
    }

    const totals = data?.totals || {};
    const traffic = (data?.traffic || []).map((t) => ({
        date: t._id,
        events: t.count,
    }));
    const topViewed = data?.topViewed || [];
    const topWhatsApp = data?.topWhatsApp || [];
    const visitorByDevice = data?.visitorByDevice || [];

    const statCards = [
        {
            label: "Total Events",
            value: totals.totalEvents ?? 0,
            icon: "📊",
        },
        {
            label: "Page Views",
            value: totals.pageViews ?? 0,
            icon: "👁️",
        },
        {
            label: "Product Views",
            value: totals.productViews ?? 0,
            icon: "🧵",
        },
        {
            label: "WhatsApp Clicks",
            value: totals.whatsappClicks ?? 0,
            icon: "💬",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-charcoal">
                        Analytics
                    </h1>
                    <p className="text-sm text-soft-grey mt-1">
                        Track performance and customer engagement
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-soft-grey">Period:</span>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="glass-input text-sm py-2 w-auto"
                    >
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                    </select>
                </div>
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
                            <div className="text-2xl font-bold text-charcoal">
                                {card.value.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-sm text-soft-grey mt-2">
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Traffic Over Time Chart */}
            <div className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-6">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                    Traffic Over Time
                </h2>
                {traffic.length > 0 ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={traffic}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: "#6B7280" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: "#6B7280" }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255,255,255,0.4)",
                                        backdropFilter: "blur(8px)",
                                        background: "rgba(255,255,255,0.9)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="events"
                                    stroke="#E6B800"
                                    strokeWidth={2}
                                    dot={{ fill: "#E6B800", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-soft-grey text-sm">
                        No traffic data yet.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Viewed Products */}
                <div className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-6">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">
                        Most Viewed Products
                    </h2>
                    {topViewed.length > 0 ? (
                        <div className="space-y-3">
                            {topViewed.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-sm font-medium text-soft-grey w-6">
                                        #{i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-charcoal truncate">
                                            {item.product?.name ||
                                                "Unknown Product"}
                                        </p>
                                        <p className="text-xs text-soft-grey">
                                            {item.count} views
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-soft-grey text-sm">
                            No product views yet.
                        </p>
                    )}
                </div>

                {/* Top WhatsApp Clicked Products */}
                <div className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-6">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">
                        Most WhatsApp Clicked
                    </h2>
                    {topWhatsApp.length > 0 ? (
                        <div className="space-y-3">
                            {topWhatsApp.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-sm font-medium text-soft-grey w-6">
                                        #{i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-charcoal truncate">
                                            {item.product?.name ||
                                                "Unknown Product"}
                                        </p>
                                        <p className="text-xs text-soft-grey">
                                            {item.count} clicks
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-soft-grey text-sm">
                            No WhatsApp clicks yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Visitor by Device */}
            {visitorByDevice.length > 0 && (
                <div className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-6">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">
                        Visitors by Device
                    </h2>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={visitorByDevice.map((d) => ({
                                        name: d._id || "Unknown",
                                        value: d.count,
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {visitorByDevice.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255,255,255,0.4)",
                                        backdropFilter: "blur(8px)",
                                        background: "rgba(255,255,255,0.9)",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {visitorByDevice.map((d, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-sm"
                            >
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            COLORS[i % COLORS.length],
                                    }}
                                />
                                <span className="text-soft-grey">
                                    {d._id || "Unknown"}: {d.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
