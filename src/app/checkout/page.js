"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";

function formatNaira(v) {
    return "₦" + Math.round(Number(v || 0)).toLocaleString("en-NG");
}

const PAYMENT_METHODS = [
    {
        value: "paystack",
        title: "Pay now with Paystack",
        text: "Card, bank transfer & USSD — secured by Paystack",
    },
    {
        value: "bank_transfer",
        title: "Bank transfer",
        text: "We will send account details after you place the order",
    },
    {
        value: "pay_on_delivery",
        title: "Pay on delivery",
        text: "Pay our delivery agent when your fabric arrives",
    },
    {
        value: "whatsapp",
        title: "Arrange via WhatsApp",
        text: "We will contact you on WhatsApp to complete payment",
    },
];

const EMPTY_FORM = {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    notes: "",
};

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const { cart, loading, refresh } = useCart();
    const { show } = useToast();

    const [form, setForm] = useState(EMPTY_FORM);
    const [paymentMethod, setPaymentMethod] = useState("paystack");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [placed, setPlaced] = useState(null);

    // Prefill contact details from the Google profile.
    useEffect(() => {
        if (session?.user) {
            setForm((f) => ({
                ...f,
                fullName: f.fullName || session.user.name || "",
                email: f.email || session.user.email || "",
            }));
        }
    }, [session]);

    const items = cart?.items || [];
    const subtotal = Number(cart?.subtotal) || 0;
    const hasStale = (cart?.staleItems || []).length > 0;
    const authed = status === "authenticated";
    const authReady = status !== "loading";

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipping: { ...form }, paymentMethod }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || "We could not place your order. Please try again.");
            }
            setPlaced(data);
            await refresh();
            if (data.paymentUrl) {
                show("Redirecting to secure payment…", "info");
                window.location.href = data.paymentUrl;
            } else {
                show("Order placed successfully", "success");
            }
        } catch (err) {
            setError(err.message);
            show(err.message, "error");
        } finally {
            setSubmitting(false);
        }
    }

    // Success panel (no payment redirect case)
    if (placed && !placed.paymentUrl) {
        return (
            <main className="shell py-16">
                <div className="card mx-auto max-w-lg rounded-3xl p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl" aria-hidden="true">
                        ✅
                    </div>
                    <h1 className="mt-5 font-display text-2xl font-bold text-ink">Order placed!</h1>
                    <p className="mt-2 text-sm text-soft-grey">{placed.message}</p>
                    <p className="mt-4 inline-block rounded-xl bg-surface-2 px-4 py-2 font-mono text-sm font-semibold text-ink">
                        {placed.order?.orderNumber}
                    </p>
                    <div className="mt-7 flex flex-col gap-2">
                        <Link href="/account?tab=orders" className="btn btn-primary btn-md">View my orders</Link>
                        <Link href="/shop" className="btn btn-outline btn-md">Continue shopping</Link>
                    </div>
                </div>
            </main>
        );
    }

    const field = (name, label, props = {}) => (
        <div>
            <label htmlFor={name} className="label">{label}</label>
            <input
                id={name}
                value={form[name]}
                onChange={(e) => set(name, e.target.value)}
                className="input"
                maxLength={props.maxLength || 200}
                required={props.required !== false}
                type={props.type || "text"}
                placeholder={props.placeholder || ""}
                autoComplete={props.autoComplete}
            />
        </div>
    );

    return (
        <main className="shell py-10">
            <p className="eyebrow">Almost there</p>
            <h1 className="section-title mt-2">Secure Checkout</h1>

            {/* Not signed in */}
            {authReady && !authed && (
                <div className="card mt-8 max-w-lg rounded-3xl p-8 text-center">
                    <p className="text-lg font-semibold text-ink">Sign in to check out</p>
                    <p className="mt-2 text-sm text-soft-grey">
                        Your cart is saved and will be waiting for you after you sign in.
                    </p>
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/checkout" })}
                        className="btn btn-primary btn-md mt-5"
                    >
                        Continue with Google
                    </button>
                </div>
            )}

            {/* Cart empty */}
            {authed && !loading && items.length === 0 && (
                <div className="empty-state card mt-8 rounded-3xl">
                    <span className="icon" aria-hidden="true">🛍️</span>
                    <p className="text-lg font-semibold text-ink">Your cart is empty</p>
                    <Link href="/shop" className="btn btn-primary btn-md mt-4">Browse fabrics</Link>
                </div>
            )}

            {/* Checkout form */}
            {authed && (
                <form onSubmit={handleSubmit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-6">
                        {hasStale && (
                            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
                                Some items in your cart changed (price or availability). Please review them in your{" "}
                                <Link href="/cart" className="font-semibold underline">cart</Link> before placing the order.
                            </div>
                        )}
                        {error && (
                            <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <section className="card rounded-3xl p-6" aria-label="Delivery details">
                            <h2 className="font-display text-lg font-bold text-ink">Delivery details</h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                {field("fullName", "Full name", { maxLength: 120, autoComplete: "name" })}
                                {field("phone", "Phone number", { maxLength: 24, type: "tel", autoComplete: "tel", placeholder: "0803 000 0000" })}
                                <div className="sm:col-span-2">
                                    {field("email", "Email address", { maxLength: 160, type: "email", autoComplete: "email" })}
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className="label">Delivery address</label>
                                    <textarea
                                        id="address"
                                        value={form.address}
                                        onChange={(e) => set("address", e.target.value)}
                                        rows={2}
                                        maxLength={300}
                                        required
                                        className="input"
                                        placeholder="House number, street, area"
                                    />
                                </div>
                                {field("city", "City", { maxLength: 120, autoComplete: "address-level2" })}
                                {field("state", "State / Region", { maxLength: 120, autoComplete: "address-level1" })}
                                <div className="sm:col-span-2">
                                    {field("country", "Country", { maxLength: 120, autoComplete: "country-name" })}
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="notes" className="label">Order notes (optional)</label>
                                    <textarea
                                        id="notes"
                                        value={form.notes}
                                        onChange={(e) => set("notes", e.target.value)}
                                        rows={2}
                                        maxLength={1000}
                                        className="input"
                                        placeholder="Any special instructions"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="card rounded-3xl p-6" aria-label="Payment method">
                            <h2 className="font-display text-lg font-bold text-ink">Payment method</h2>
                            <div className="mt-4 space-y-3">
                                {PAYMENT_METHODS.map((m) => (
                                    <label
                                        key={m.value}
                                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                                            paymentMethod === m.value
                                                ? "border-brand bg-brand/5"
                                                : "border-border hover:border-ink/20"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={m.value}
                                            checked={paymentMethod === m.value}
                                            onChange={() => setPaymentMethod(m.value)}
                                            className="mt-1 accent-brand"
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold text-ink">{m.title}</span>
                                            <span className="block text-xs text-soft-grey">{m.text}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <p className="field-hint mt-3">
                                🔒 Card details are handled entirely by Paystack — they never touch our servers.
                            </p>
                        </section>
                    </div>

                    {/* Summary */}
                    <aside className="card sticky top-24 rounded-3xl p-6" aria-label="Order summary">
                        <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>
                        {loading ? (
                            <div className="mt-4 space-y-3">
                                <div className="skeleton h-12" />
                                <div className="skeleton h-12" />
                            </div>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {items.map((item) => (
                                    <li key={item._id} className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                                            {item.image && (
                                                <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                                            <p className="text-xs text-soft-grey">
                                                {formatNaira(item.unitPrice)} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-ink">{formatNaira(item.subtotal)}</p>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-soft-grey">Subtotal</dt>
                                <dd className="font-medium text-ink">{formatNaira(subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-soft-grey">Delivery</dt>
                                <dd className="font-medium text-ink">Free</dd>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 text-base">
                                <dt className="font-semibold text-ink">Total</dt>
                                <dd className="font-bold text-brand">{formatNaira(subtotal)}</dd>
                            </div>
                        </dl>

                        <button
                            type="submit"
                            disabled={submitting || loading || items.length === 0 || hasStale}
                            className="btn btn-primary btn-block btn-lg mt-6"
                        >
                            {submitting ? "Placing order…" : paymentMethod === "paystack" ? "Pay securely now" : "Place order"}
                        </button>
                        <p className="field-hint mt-2 text-center">
                            Totals are verified server-side before payment.
                        </p>
                    </aside>
                </form>
            )}
        </main>
    );
}




