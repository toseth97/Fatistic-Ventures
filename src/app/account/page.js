"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useToast } from "@/components/Toast";

function formatNaira(v) {
    return "₦" + Math.round(Number(v || 0)).toLocaleString("en-NG");
}

function formatDate(v) {
    if (!v) return "";
    return new Date(v).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

const STATUS_STYLES = {
    Pending: "badge-amber",
    Confirmed: "badge-ink",
    Processing: "badge-ink",
    Shipped: "badge-emerald",
    Delivered: "badge-emerald",
    Cancelled: "badge-red",
};

const ORDER_STATUSES = Object.keys(STATUS_STYLES);

export default function AccountPage() {
    const { data: session, status } = useSession();
    const { show } = useToast();

    const [tab, setTab] = useState("profile");
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
    const [savingProfile, setSavingProfile] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Tab can be preselected via ?tab=orders
    useEffect(() => {
        if (typeof window === "undefined") return;
        const t = new URLSearchParams(window.location.search).get("tab");
        if (t && ["profile", "orders", "settings"].includes(t)) setTab(t);
    }, []);

    const loadProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/profile");
            if (!res.ok) return;
            const data = await res.json();
            setProfile(data.user || null);
            setEditForm({
                name: data.user?.name || "",
                phone: data.user?.phone || "",
                address: data.user?.address || "",
            });
        } catch {
            /* keep session data */
        }
    }, []);

    const loadOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/orders?limit=20");
            if (!res.ok) return;
            const data = await res.json();
            setOrders(data.orders || []);
        } catch {
            setOrders([]);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            loadProfile();
            loadOrders();
        }
    }, [status, loadProfile, loadOrders]);

    // Server-side payment verification after returning from Paystack.
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        if (params.get("payment") !== "verify") return;
        const ref = params.get("ref");
        if (!ref) return;
        setVerifying(true);
        fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: ref }),
        })
            .then((r) => r.json().catch(() => ({})))
            .then((d) => {
                if (d.verified) {
                    show(`Payment confirmed${d.orderNumber ? ` for ${d.orderNumber}` : ""}. Thank you!`, "success");
                } else {
                    show(d.message || "Payment could not be verified yet. If you were debited, it will reflect shortly.", "info");
                }
                loadOrders();
            })
            .catch(() => show("Payment verification failed. Please try again.", "error"))
            .finally(() => {
                setVerifying(false);
                window.history.replaceState({}, "", "/account");
            });
    }, [show, loadOrders]);

    async function saveProfile(e) {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Could not save profile");
            setProfile((p) => ({ ...p, ...data.user }));
            show("Profile updated", "success");
        } catch (err) {
            show(err.message, "error");
        } finally {
            setSavingProfile(false);
        }
    }

    const user = profile || session?.user || {};
    const avatar =
        profile?.picture || session?.user?.image || session?.user?.picture || user?.picture || "";
    const displayName = user.name || "Valued customer";
    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (status === "loading") {
        return (
            <main className="shell py-14">
                <div className="card mx-auto max-w-3xl rounded-3xl p-8">
                    <div className="skeleton h-24" />
                    <div className="skeleton mt-4 h-64" />
                </div>
            </main>
        );
    }

    if (status === "unauthenticated") {
        return (
            <main className="shell py-16">
                <div className="card mx-auto max-w-md rounded-3xl p-10 text-center">
                    <span className="text-4xl" aria-hidden="true">👤</span>
                    <h1 className="mt-4 font-display text-2xl font-bold text-ink">Sign in required</h1>
                    <p className="mt-2 text-sm text-soft-grey">
                        Sign in to view your profile and orders.
                    </p>
                    <Link href="/signin" className="btn btn-primary btn-md mt-5">
                        Sign in with Google
                    </Link>
                </div>
            </main>
        );
    }

    if (verifying) {
        return (
            <main className="shell py-16">
                <div className="card mx-auto max-w-md rounded-3xl p-10 text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
                    <p className="mt-4 text-sm text-soft-grey">Verifying your payment securely…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="shell py-10">
            {/* Profile header */}
            <section className="card rounded-3xl p-6 sm:p-8" aria-label="Profile overview">
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt={`${displayName}'s profile`}
                            width={72}
                            height={72}
                            className="h-18 w-18 rounded-2xl border border-border object-cover"
                            style={{ height: 72, width: 72 }}
                        />
                    ) : (
                        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-brand/10 font-display text-2xl font-bold text-brand">
                            {initials}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="font-display text-2xl font-bold text-ink">{displayName}</h1>
                        <p className="truncate text-sm text-soft-grey">{user.email}</p>
                        <p className="mt-1 text-xs text-soft-grey">
                            {user.createdAt ? `Member since ${formatDate(user.createdAt)}` : "Google-secured account"}
                        </p>
                    </div>
                    <Link href="/cart" className="btn btn-outline btn-md shrink-0">View cart</Link>
                </div>
            </section>

            {/* Tabs */}
            <div className="mt-6 flex gap-1 rounded-2xl border border-border bg-white p-1" role="tablist" aria-label="Account sections">
                {[
                    ["profile", "Profile"],
                    ["orders", `My Orders${Array.isArray(orders) ? ` (${orders.length})` : ""}`],
                    ["settings", "Settings"],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => setTab(key)}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                            tab === key ? "bg-brand text-white shadow" : "text-ink hover:bg-surface-2"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ---------------------------- PROFILE TAB ---------------------------- */}
            {tab === "profile" && (
                <section className="mt-6 grid gap-6 lg:grid-cols-2" aria-label="Profile">
                    <div className="card rounded-3xl p-6">
                        <h2 className="font-display text-lg font-bold text-ink">Account information</h2>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-soft-grey">Full name</dt>
                                <dd className="font-medium text-ink">{user.name || "—"}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-soft-grey">Email</dt>
                                <dd className="font-medium text-ink">{user.email || "—"}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-soft-grey">Phone</dt>
                                <dd className="font-medium text-ink">{user.phone || "—"}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-soft-grey">Delivery address</dt>
                                <dd className="max-w-[60%] text-right font-medium text-ink">{user.address || "—"}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-soft-grey">Member since</dt>
                                <dd className="font-medium text-ink">{user.createdAt ? formatDate(user.createdAt) : "—"}</dd>
                            </div>
                        </dl>
                    </div>

                    <form onSubmit={saveProfile} className="card rounded-3xl p-6" aria-label="Edit profile">
                        <h2 className="font-display text-lg font-bold text-ink">Update details</h2>
                        <p className="field-hint">
                            Your name, email and photo come from Google and can&apos;t be changed here.
                        </p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="name" className="label">Display name</label>
                                <input
                                    id="name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                    maxLength={120}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="label">Phone</label>
                                <input
                                    id="phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                                    maxLength={24}
                                    className="input"
                                    placeholder="0803 000 0000"
                                />
                            </div>
                            <div>
                                <label htmlFor="addr" className="label">Default delivery address</label>
                                <textarea
                                    id="addr"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                                    maxLength={300}
                                    rows={2}
                                    className="input"
                                />
                            </div>
                            <button type="submit" disabled={savingProfile} className="btn btn-primary btn-md">
                                {savingProfile ? "Saving…" : "Save changes"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* ---------------------------- ORDERS TAB ---------------------------- */}
            {tab === "orders" && (
                <section className="mt-6 space-y-4" aria-label="Order history">
                    {orders === null ? (
                        <>
                            <div className="skeleton h-28" />
                            <div className="skeleton h-28" />
                        </>
                    ) : orders.length === 0 ? (
                        <div className="empty-state card rounded-3xl">
                            <span className="icon" aria-hidden="true">📦</span>
                            <p className="text-lg font-semibold text-ink">No orders yet</p>
                            <p className="mt-1 max-w-sm text-sm text-soft-grey">
                                When you place an order it will appear here with live status updates.
                            </p>
                            <Link href="/shop" className="btn btn-primary btn-md mt-4">Start shopping</Link>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const open = expandedOrder === order._id;
                            return (
                                <article key={order._id} className="card overflow-hidden rounded-3xl">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedOrder(open ? null : order._id)}
                                        className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
                                        aria-expanded={open}
                                    >
                                        <div>
                                            <p className="font-mono text-sm font-semibold text-ink">{order.orderNumber}</p>
                                            <p className="text-xs text-soft-grey">
                                                {formatDate(order.createdAt)} · {order.items?.length || 0} item(s)
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`badge ${STATUS_STYLES[order.status] || "badge-ink"}`}>
                                                {order.status}
                                            </span>
                                            <span className={`badge ${order.paymentStatus === "Paid" ? "badge-emerald" : "badge-amber"}`}>
                                                {order.paymentStatus}
                                            </span>
                                            <span className="font-bold text-ink">{formatNaira(order.total)}</span>
                                            <span className={`text-soft-grey transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">▾</span>
                                        </div>
                                    </button>

                                    {open && (
                                        <div className="border-t border-border bg-surface-2/50 p-5">
                                            <ul className="space-y-2">
                                                {(order.items || []).map((it, i) => (
                                                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                                                        <span className="text-ink">
                                                            {it.name} <span className="text-soft-grey">× {it.quantity}</span>
                                                        </span>
                                                        <span className="font-medium text-ink">
                                                            {formatNaira(it.unitPrice * it.quantity)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
                                                <div className="flex justify-between">
                                                    <dt className="text-soft-grey">Subtotal</dt>
                                                    <dd className="text-ink">{formatNaira(order.subtotal)}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-soft-grey">Delivery</dt>
                                                    <dd className="text-ink">{formatNaira(order.deliveryFee || 0)}</dd>
                                                </div>
                                                <div className="flex justify-between font-semibold">
                                                    <dt className="text-ink">Total</dt>
                                                    <dd className="text-brand">{formatNaira(order.total)}</dd>
                                                </div>
                                            </dl>
                                            <p className="mt-4 text-xs text-soft-grey">
                                                Deliver to: {order.shipping?.fullName}, {order.shipping?.address},{" "}
                                                {order.shipping?.city}, {order.shipping?.state}, {order.shipping?.country}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })
                    )}
                </section>
            )}

            {/* ---------------------------- SETTINGS TAB ---------------------------- */}
            {tab === "settings" && (
                <section className="mt-6 grid gap-6 lg:grid-cols-2" aria-label="Account settings">
                    <div className="card rounded-3xl p-6">
                        <h2 className="font-display text-lg font-bold text-ink">Account &amp; security</h2>
                        <ul className="mt-4 space-y-3 text-sm text-soft-grey">
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                You signed in with Google. Your password is never stored here.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                Your Google identity (email, photo) is managed by Google and can&apos;t be edited here.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-success">✓</span>
                                Signing out below ends your session on this device.
                            </li>
                        </ul>
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="btn btn-danger btn-md mt-6"
                        >
                            Sign out
                        </button>
                    </div>

                    <div className="card rounded-3xl p-6">
                        <h2 className="font-display text-lg font-bold text-ink">Need help?</h2>
                        <p className="mt-3 text-sm text-soft-grey">
                            Questions about an order, delivery or a fabric? Our team is happy to help.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link href="/contact" className="btn btn-outline btn-md">Contact us</Link>
                            <a
                                href="https://wa.me/2348062572564"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-ghost btn-md text-success"
                            >
                                WhatsApp support
                            </a>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}





