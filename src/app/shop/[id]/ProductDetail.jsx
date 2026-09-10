"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { IconBag, IconChevron, IconClose, IconWhatsApp } from "@/components/Icons";

function formatNaira(v) {
    return "₦" + Math.round(Number(v || 0)).toLocaleString("en-NG");
}

export default function ProductDetail({ product, categoryName, whatsappHref }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const { show } = useToast();

    const price = Number(product.price) || 0;
    const compareAt = Number(product.compareAtPrice) || 0;
    const hasSale = compareAt > price;
    const images = (product.images || []).filter((i) => i?.url);
    const stock = Math.max(0, Number(product.quantity) || 0);
    const outOfStock = product.inStock === false || stock <= 0;
    const maxQty = Math.max(1, Math.min(stock, 1000));

    const [active, setActive] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [qty, setQty] = useState(1);
    const [busy, setBusy] = useState(false);

    // Reset when product changes (e.g. navigating between related products).
    useEffect(() => {
        setActive(0);
        setQty(1);
    }, [product?._id]);

    // Lightbox keyboard controls.
    useEffect(() => {
        if (!lightbox) return;
        function onKey(e) {
            if (e.key === "Escape") setLightbox(false);
            if (e.key === "ArrowRight") setActive((i) => (i + 1) % Math.max(1, images.length));
            if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % Math.max(1, images.length));
        }
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [lightbox, images.length]);

    async function handleAdd(buyNow = false) {
        if (outOfStock || busy) return;
        setBusy(true);
        const result = await addToCart(product._id, qty);
        setBusy(false);
        if (result.added) {
            if (buyNow) {
                router.push("/checkout");
            } else {
                show(`${product.name} added to your bag`, "success");
            }
        } else {
            show(result.error || "Could not add to cart", "error");
        }
    }

    const currentImage = images[active]?.url || images[0]?.url;

    return (
        <div className="grid gap-10 lg:grid-cols-2">
            {/* ---------------------------- GALLERY ---------------------------- */}
            <div>
                <button
                    type="button"
                    onClick={() => currentImage && setLightbox(true)}
                    className="group relative block aspect-square w-full overflow-hidden rounded-3xl border border-border bg-white"
                    aria-label="View larger image"
                >
                    {currentImage ? (
                        <Image
                            src={currentImage}
                            alt={product.name}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-gold-100 text-6xl" aria-hidden="true">
                            🧵
                        </div>
                    )}
                    <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                        Click to zoom
                    </span>
                </button>

                {images.length > 1 && (
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActive(i)}
                                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                                    i === active ? "border-brand" : "border-border hover:border-ink/30"
                                }`}
                                aria-label={`View image ${i + 1}`}
                                aria-current={i === active}
                            >
                                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ---------------------------- DETAILS ---------------------------- */}
            <div>
                {categoryName && <span className="badge badge-amber">{categoryName}</span>}
                <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                    {product.name}
                </h1>

                <div className="mt-4 flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl font-bold text-ink">{formatNaira(price)}</span>
                    {hasSale && (
                        <>
                            <span className="text-lg text-soft-grey line-through">{formatNaira(compareAt)}</span>
                            <span className="badge bg-brand text-white">
                                Save {Math.round(((compareAt - price) / compareAt) * 100)}%
                            </span>
                        </>
                    )}
                </div>

                {/* Availability */}
                <p className="mt-3 text-sm font-medium">
                    {outOfStock ? (
                        <span className="badge badge-red">Out of stock</span>
                    ) : stock <= 5 ? (
                        <span className="text-warning">Low stock — only {stock} left</span>
                    ) : (
                        <span className="text-success">In stock — {stock} available</span>
                    )}
                </p>

                {product.description && (
                    <div className="prose-safe mt-6 text-sm leading-relaxed text-soft-grey">
                        {product.description}
                    </div>
                )}

                {/* Quantity + actions */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-ink">Quantity</span>
                        <div className="flex items-center rounded-xl border border-border">
                            <button
                                type="button"
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                disabled={outOfStock || qty <= 1}
                                className="flex h-10 w-10 items-center justify-center text-lg text-ink disabled:opacity-40"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                value={qty}
                                min={1}
                                max={outOfStock ? 1 : maxQty}
                                onChange={(e) => {
                                    const v = Math.floor(Number(e.target.value) || 1);
                                    setQty(Math.min(Math.max(1, v), outOfStock ? 1 : maxQty));
                                }}
                                className="h-10 w-14 border-x border-border text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                aria-label="Quantity"
                            />
                            <button
                                type="button"
                                onClick={() => setQty((q) => Math.min(outOfStock ? 1 : maxQty, q + 1))}
                                disabled={outOfStock || qty >= maxQty}
                                className="flex h-10 w-10 items-center justify-center text-lg text-ink disabled:opacity-40"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                        {!outOfStock && qty > 1 && (
                            <span className="text-sm text-soft-grey">
                                Subtotal: <span className="font-semibold text-ink">{formatNaira(price * qty)}</span>
                            </span>
                        )}
                    </div>
                    {outOfStock && (
                        <p className="field-hint">This fabric is currently unavailable. Check back soon or contact us.</p>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => handleAdd(false)}
                            disabled={outOfStock || busy}
                            className="btn btn-outline btn-lg flex-1"
                        >
                            <IconBag className="h-5 w-5" /> {busy ? "Adding…" : "Add to Cart"}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAdd(true)}
                            disabled={outOfStock || busy}
                            className="btn btn-primary btn-lg flex-1"
                        >
                            Buy Now
                        </button>
                    </div>

                    {whatsappHref && (
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-md w-full text-success"
                        >
                            <IconWhatsApp className="h-5 w-5" /> Ask about this fabric on WhatsApp
                        </a>
                    )}
                </div>

                {/* Trust points */}
                <ul className="mt-8 grid gap-3 border-t border-border pt-6 text-sm text-soft-grey sm:grid-cols-2">
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Nationwide &amp; worldwide delivery</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Secure payment via Paystack</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> 100% authentic fabrics</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Quality guaranteed</li>
                </ul>
            </div>

            {/* ---------------------------- LIGHTBOX ---------------------------- */}
            {lightbox && currentImage && (
                <div
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image viewer"
                    onClick={() => setLightbox(false)}
                >
                    <button
                        type="button"
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
                        onClick={() => setLightbox(false)}
                        aria-label="Close viewer"
                    >
                        <IconClose className="h-6 w-6" />
                    </button>

                    {images.length > 1 && (
                        <button
                            type="button"
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActive((i) => (i - 1 + images.length) % images.length);
                            }}
                            aria-label="Previous image"
                        >
                            <IconChevron dir="left" className="h-6 w-6" />
                        </button>
                    )}

                    <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                        <Image src={currentImage} alt={product.name} fill sizes="100vw" className="object-contain" />
                    </div>

                    {images.length > 1 && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActive((i) => (i + 1) % images.length);
                            }}
                            aria-label="Next image"
                        >
                            <IconChevron className="h-6 w-6" />
                        </button>
                    )}

                    <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/70">
                        {active + 1} / {images.length}
                    </p>
                </div>
            )}
        </div>
    );
}



