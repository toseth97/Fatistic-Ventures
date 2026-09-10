"use client";

import { useCallback, useEffect, useState } from "react";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

function formatNaira(v) {
    return "₦" + Math.round(Number(v || 0)).toLocaleString("en-NG");
}

function formatDate(v) {
    if (!v) return "";
    return new Date(v).toLocaleDateString("en-NG", {
        year: "numeric", month: "short", day: "numeric",
    });
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(null);
    const [detail, setDetail] = useState(null);
    const [updating, setUpdating] = useState("");

    const fetchOrders = useCallback(async (p = 1) => {
        try {
            const token = localStorage.getItem("admin_token");
            const params = new URLSearchParams({ page: String(p), limit: "15" });
            if (q) params.set("q", q);
            if (status) params.set("status", status);
            if (paymentStatus) params.set("paymentStatus", paymentStatus);
            const res = await fetch(`/api/admin/orders?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load orders");
            setOrders(data.orders || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setPage(data.page || 1);
        } catch (err) {
            setError(err.message);
        }
    }, [q, status, paymentStatus]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    async function openDetail(order) {
        if (expanded === order._id) {
            setExpanded(null);
            setDetail(null);
            return;
        }
        setExpanded(order._id);
        setDetail(null);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/admin/orders/${order._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load order");
            setDetail(data);
        } catch (err) {
            setError(err.message);
        }
    }

    async function updateOrder(order, patch) {
        setUpdating(order._id);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/admin/orders/${order._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(patch),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update order");
            await fetchOrders(page);
            setExpanded(null);
            setDetail(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating("");
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-charcoal">Orders</h1>
                <p className="mt-1 text-sm text-soft-grey">
                    {total} order(s) — click an order to view details and update status
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-200/60 bg-white/90 p-4 shadow-sm">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search order #, email or name…"
                    className="w-full max-w-xs rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    aria-label="Filter by order status"
                >
                    <option value="">All statuses</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    aria-label="Filter by payment status"
                >
                    <option value="">All payments</option>
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* List */}
            {orders === null ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200/60" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-10 text-center text-sm text-soft-grey">
                    No orders match your filters.
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order._id} className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white/90 shadow-sm">
                            <button
                                type="button"
                                onClick={() => openDetail(order)}
                                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                                aria-expanded={expanded === order._id}
                            >
                                <div>
                                    <p className="font-mono text-sm font-semibold text-charcoal">{order.orderNumber}</p>
                                    <p className="text-xs text-soft-grey">
                                        {formatDate(order.createdAt)} · {order.shipping?.fullName || order.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                        order.status === "Delivered" ? "bg-emerald-100 text-emerald-700"
                                        : order.status === "Cancelled" ? "bg-red-100 text-red-600"
                                        : "bg-amber-100 text-amber-700"
                                    }`}>
                                        {order.status}
                                    </span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                        order.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                                    }`}>
                                        {order.paymentStatus}
                                    </span>
                                    <span className="font-bold text-charcoal">{formatNaira(order.total)}</span>
                                    <span className="text-soft-grey" aria-hidden="true">▾</span>
                                </div>
                            </button>

                            {expanded === order._id && (
                                <div className="border-t border-gray-200/70 bg-gray-50/60 p-5">
                                    {detail === null ? (
                                        <div className="h-20 animate-pulse rounded-xl bg-gray-200/60" />
                                    ) : (
                                        <div className="grid gap-5 lg:grid-cols-2">
                                            {/* Items + totals */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-charcoal">Items</h3>
                                                <ul className="mt-2 space-y-1.5 text-sm">
                                                    {(detail.order.items || []).map((it, i) => (
                                                        <li key={i} className="flex justify-between gap-3">
                                                            <span className="text-charcoal">
                                                                {it.name} <span className="text-soft-grey">× {it.quantity}</span>
                                                            </span>
                                                            <span className="font-medium">{formatNaira(it.unitPrice * it.quantity)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-3 space-y-1 border-t border-gray-200 pt-2 text-sm">
                                                    <p className="flex justify-between"><span className="text-soft-grey">Subtotal</span><span>{formatNaira(detail.order.subtotal)}</span></p>
                                                    <p className="flex justify-between"><span className="text-soft-grey">Delivery</span><span>{formatNaira(detail.order.deliveryFee || 0)}</span></p>
                                                    <p className="flex justify-between font-bold"><span>Total</span><span>{formatNaira(detail.order.total)}</span></p>
                                                </div>
                                                {detail.payment && (
                                                    <p className="mt-3 text-xs text-soft-grey">
                                                        Payment: {detail.payment.provider || "—"} · {detail.payment.status}
                                                        {detail.payment.reference ? ` · ref ${detail.payment.reference}` : ""}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Customer + status controls */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-charcoal">Customer</h3>
                                                <div className="mt-2 space-y-1 text-sm text-charcoal">
                                                    <p>{detail.order.shipping?.fullName}</p>
                                                    <p className="text-soft-grey">{detail.order.shipping?.phone} · {detail.order.email}</p>
                                                    <p className="text-soft-grey">
                                                        {detail.order.shipping?.address}, {detail.order.shipping?.city},{" "}
                                                        {detail.order.shipping?.state}, {detail.order.shipping?.country}
                                                    </p>
                                                    {detail.order.shipping?.notes && (
                                                        <p className="italic text-soft-grey">“{detail.order.shipping.notes}”</p>
                                                    )}
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <label className="text-xs font-medium text-soft-grey">
                                                        Order status
                                                        <select
                                                            defaultValue={detail.order.status}
                                                            onChange={(e) => updateOrder(detail.order, { status: e.target.value })}
                                                            disabled={updating === detail.order._id}
                                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-charcoal"
                                                        >
                                                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </label>
                                                    <label className="text-xs font-medium text-soft-grey">
                                                        Payment status
                                                        <select
                                                            defaultValue={detail.order.paymentStatus}
                                                            onChange={(e) => updateOrder(detail.order, { paymentStatus: e.target.value })}
                                                            disabled={updating === detail.order._id}
                                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-charcoal"
                                                        >
                                                            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </label>
                                                </div>
                                                {updating === detail.order._id && (
                                                    <p className="mt-2 text-xs text-soft-grey">Updating…</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => fetchOrders(page - 1)}
                        disabled={page <= 1}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
                    >
                        ← Previous
                    </button>
                    <span className="text-sm text-soft-grey">Page {page} of {pages}</span>
                    <button
                        type="button"
                        onClick={() => fetchOrders(page + 1)}
                        disabled={page >= pages}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}





