"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlassModal from "@/components/ui/GlassModal";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    async function fetchProducts() {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setProducts(data.products || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    async function handleDelete(id) {
        setDeleting(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }
            setProducts((prev) => prev.filter((p) => p._id !== id));
            setDeleteTarget(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-200/50 rounded-glass-sm animate-pulse" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-16 bg-gray-200/50 rounded-glass-lg animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-charcoal">
                        Products
                    </h1>
                    <p className="text-sm text-soft-grey mt-1">
                        {products.length} product{products.length !== 1 && "s"}{" "}
                        total
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="glass-button-gold text-sm"
                >
                    Add Product
                </Link>
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-glass-sm px-4 py-2">
                    {error}
                </div>
            )}

            {products.length === 0 ? (
                <div className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-8 text-center">
                    <div className="text-4xl mb-3">🧵</div>
                    <p className="text-soft-grey">
                        No products yet. Start by adding your first fabric.
                    </p>
                    <Link
                        href="/admin/products/new"
                        className="glass-button-gold mt-4 inline-flex text-sm"
                    >
                        Add Product
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map((product) => {
                        const price =
                            typeof product.price === "number"
                                ? product.price
                                : Number(product.price || 0);
                        const img = product.images?.[0]?.url;

                        return (
                            <div
                                key={product._id}
                                className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-4 flex items-center gap-4"
                            >
                                <div className="w-14 h-14 rounded-glass-sm overflow-hidden border border-gray-200/50 flex-shrink-0">
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                            No img
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-charcoal truncate">
                                            {product.name}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-soft-grey">
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="text-sm text-soft-grey mt-0.5">
                                        ₦{price.toLocaleString()}
                                        {!product.inStock && (
                                            <span className="ml-2 text-red-500">
                                                Out of stock
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-soft-grey">
                                    <span title="Views">
                                        👁️ {product.viewCount || 0}
                                    </span>
                                    <span title="WhatsApp clicks">
                                        💬 {product.whatsappClickCount || 0}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/products/${product._id}/edit`}
                                        className="glass-button-ghost text-xs px-3 py-1.5"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeleteTarget(product)}
                                        className="glass-button text-xs px-3 py-1.5 bg-red-50 border-red-200/50 text-red-600 hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete confirmation modal */}
            <GlassModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Product"
                footer={
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="glass-button-ghost text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(deleteTarget._id)}
                            disabled={deleting}
                            className="glass-button text-sm bg-red-500/90 border-red-400/50 text-white hover:bg-red-500"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                }
            >
                <p className="text-soft-grey">
                    Are you sure you want to delete{" "}
                    <strong className="text-charcoal">
                        {deleteTarget?.name}
                    </strong>
                    ? This action cannot be undone.
                </p>
            </GlassModal>
        </div>
    );
}
