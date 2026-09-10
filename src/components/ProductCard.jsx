"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { IconBag, IconStar } from "@/components/Icons";

function formatNaira(value) {
    const n = Number(value || 0);
    return "₦" + Math.round(n).toLocaleString("en-NG");
}

export default function ProductCard({ product, priority = false }) {
    const { addToCart } = useCart();
    const { show } = useToast();
    if (!product) return null;

    const price = Number(product.price) || 0;
    const compareAt = Number(product.compareAtPrice) || 0;
    const hasSale = compareAt > price;
    const outOfStock = product.inStock === false || Number(product.quantity) <= 0;
    const image = product.images?.[0]?.url || "";
    const href = `/shop/${product.slug || product._id}`;
    const category = product.categoryName || product.category || "";

    async function handleAdd(e) {
        e.preventDefault();
        e.stopPropagation();
        if (outOfStock || !product._id) return;
        const result = await addToCart(product._id, 1);
        if (result.added) {
            show(`${product.name} added to your bag`, "success");
        } else {
            show(result.error || "Could not add to cart", "error");
        }
    }

    return (
        <Link
            href={href}
            className="group card overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-lg"
        >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                {image ? (
                    <Image
                        src={image}
                        alt={product.name || "Fabric product"}
                        width={640}
                        height={800}
                        priority={priority}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                        No image
                    </div>
                )}

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    {hasSale && (
                        <span className="badge bg-brand text-white border-brand">
                            Sale
                        </span>
                    )}
                    {product.featured && (
                        <span className="badge bg-gold-500 text-ink border-gold-500">
                            <IconStar className="h-3 w-3" filled /> Featured
                        </span>
                    )}
                </div>
                {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                        <span className="badge bg-ink text-white">Out of stock</span>
                    </div>
                )}

                {/* Quick add */}
                {!outOfStock && (
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 btn btn-dark btn-sm w-[calc(100%-1.5rem)]"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <IconBag className="h-4 w-4" /> Add to Cart
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-4">
                {category ? (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-soft-grey">
                        {category}
                    </span>
                ) : null}
                <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-ink group-hover:text-brand transition-colors">
                    {product.name}
                </h3>
                <div className="mt-auto pt-1 flex items-baseline gap-2">
                    <span className="text-base font-bold text-ink">
                        {formatNaira(price)}
                    </span>
                    {hasSale && (
                        <span className="text-xs text-soft-grey line-through">
                            {formatNaira(compareAt)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}