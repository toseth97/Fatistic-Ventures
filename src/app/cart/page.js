"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";

function formatNaira(v) {
    return "₦" + Math.round(Number(v || 0)).toLocaleString("en-NG");
}

export default function CartPage() {
    const { cart, loading, updateQty, removeItem, clearCart } = useCart();
    const { show } = useToast();
    const [busyId, setBusyId] = useState(null);
    const [clearing, setClearing] = useState(false);

    const items = cart?.items || [];
    const subtotal = Number(cart?.subtotal) || 0;
    const totalQty = Number(cart?.totalQuantity) || 0;
    const staleItems = cart?.staleItems || [];
    const hasStale = staleItems.length > 0;
    const allUnavailable = items.length > 0 && items.every((i) => !i.available);

    async function changeQty(item, nextQty) {
        if (busyId) return;
        setBusyId(item.productId);
        const result = await updateQty(item.productId, nextQty);
        setBusyId(null);
        if (result && result.ok === false && result.error) show(result.error, "error");
    }

    async function handleRemove(item) {
        if (busyId) return;
        setBusyId(item.productId);
        const ok = await removeItem(item.productId);
        setBusyId(null);
        if (ok) show(`${item.name} removed from cart`, "info");
    }

    async function handleClear() {
        if (!window.confirm("Remove all items from your cart?")) return;
        setClearing(true);
        await clearCart();
        setClearing(false);
        show("Cart cleared", "info");
    }

    return (
        <main className="shell py-10">
            <p className="eyebrow">Your selection</p>
            <h1 className="section-title mt-2">Shopping Cart</h1>

            {loading ? (
                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="card p-4">
                                <div className="flex gap-4">
                                    <div className="skeleton h-24 w-24" />
                                    <div className="flex-1 space-y-2 py-2">
                                        <div className="skeleton h-4 w-2/3" />
                                        <div className="skeleton h-3 w-1/3" />
                                        <div className="skeleton h-8 w-40" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="card h-64 p-6"><div className="skeleton h-full" /></div>
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state card mt-8 rounded-3xl">
                    <span className="icon" aria-hidden="true">🛍️</span>
                    <p className="text-lg font-semibold text-ink">Your cart is empty</p>
                    <p className="mt-1 max-w-sm text-sm text-soft-grey">
                        Browse our premium fabrics and add something beautiful to your bag.
                    </p>
                    <Link href="/shop" className="btn btn-primary btn-md mt-5">
                        Continue shopping
                    </Link>
                </div>
            ) : (

                <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
                    {/* Line items */}
                    <section aria-label="Cart items" className="space-y-4">
                        {hasStale && (
                            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
                                <p className="font-semibold">Some items need your attention</p>
                                <ul className="mt-1 list-inside list-disc space-y-0.5">
                                    {staleItems.map((i) => (
                                        <li key={i._id}>
                                            {i.available
                                                ? `“${i.name}” — the price has changed to ${formatNaira(i.unitPrice)}`
                                                : `“${i.name}” is no longer available`}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-1 text-xs opacity-80">
                                    Please review these items before checking out.
                                </p>
                            </div>
                        )}

                        {items.map((item) => {
                            const max = Math.max(1, Number(item.availableQuantity) || 0);
                            const overRequested = item.quantity > max && item.available;
                            return (
                                <div key={item._id} className={`card p-4 ${!item.available ? "opacity-70" : ""}`}>
                                    <div className="flex gap-4">
                                        <Link
                                            href={item.slug ? `/shop/${item.slug}` : "/shop"}
                                            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-28 sm:w-28"
                                        >
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
                                            ) : (
                                                <span className="flex h-full items-center justify-center text-3xl" aria-hidden="true">🧵</span>
                                            )}
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={item.slug ? `/shop/${item.slug}` : "/shop"}
                                                        className="line-clamp-2 font-medium text-ink hover:text-brand"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <p className="mt-0.5 text-sm text-soft-grey">
                                                        {formatNaira(item.unitPrice)} each
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(item)}
                                                    disabled={busyId === item.productId}
                                                    className="shrink-0 rounded-lg p-2 text-soft-grey transition-colors hover:bg-red-50 hover:text-danger"
                                                    aria-label={`Remove ${item.name} from cart`}
                                                >
                                                    🗑️
                                                </button>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                                {item.available ? (
                                                    <div className="flex items-center rounded-xl border border-border">
                                                        <button
                                                            type="button"
                                                            onClick={() => changeQty(item, item.quantity - 1)}
                                                            disabled={busyId === item.productId || item.quantity <= 1}
                                                            className="flex h-9 w-9 items-center justify-center text-ink disabled:opacity-40"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-10 border-x border-border text-center text-sm font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => changeQty(item, item.quantity + 1)}
                                                            disabled={busyId === item.productId || item.quantity >= max}
                                                            className="flex h-9 w-9 items-center justify-center text-ink disabled:opacity-40"
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="badge badge-red">Unavailable</span>
                                                )}

                                                <p className="text-right">
                                                    <span className="block text-xs text-soft-grey">
                                                        {formatNaira(item.unitPrice)} × {item.quantity}
                                                    </span>
                                                    <span className="font-bold text-ink">{formatNaira(item.subtotal)}</span>
                                                </p>
                                            </div>

                                            {overRequested && (
                                                <p className="field-error">
                                                    Only {max} unit(s) available — please reduce the quantity.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex justify-between pt-2">
                            <Link href="/shop" className="btn btn-ghost btn-md">
                                ← Continue shopping
                            </Link>
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={clearing}
                                className="btn btn-ghost btn-md text-danger hover:bg-red-50"
                            >
                                {clearing ? "Clearing…" : "Clear cart"}
                            </button>
                        </div>
                    </section>

                    {/* Summary */}
                    <aside className="card sticky top-24 rounded-3xl p-6" aria-label="Order summary">
                        <h2 className="font-display text-xl font-bold text-ink">Order Summary</h2>
                        <dl className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-soft-grey">Total items</dt>
                                <dd className="font-medium text-ink">{totalQty}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-soft-grey">Subtotal</dt>
                                <dd className="font-bold text-ink">{formatNaira(subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-soft-grey">Delivery</dt>
                                <dd className="text-soft-grey">Calculated at checkout</dd>
                            </div>
                        </dl>
                        <div className="mt-4 border-t border-border pt-4">
                            <div className="flex justify-between text-base">
                                <span className="font-semibold text-ink">Estimated total</span>
                                <span className="font-bold text-brand">{formatNaira(subtotal)}</span>
                            </div>
                            <p className="field-hint">Final totals are confirmed on the secure checkout page.</p>
                        </div>

                        <Link
                            href="/checkout"
                            aria-disabled={allUnavailable || hasStale}
                            className={`btn btn-primary btn-block btn-lg mt-5 ${
                                allUnavailable || hasStale ? "pointer-events-none opacity-50" : ""
                            }`}
                        >
                            Proceed to checkout
                        </Link>
                        {hasStale && (
                            <p className="mt-2 text-center text-xs text-warning">
                                Review the highlighted items to continue.
                            </p>
                        )}
                    </aside>
                </div>
            )}
        </main>
    );
}




