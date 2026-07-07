"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "Aso-Oke",
        inStock: true,
        images: [],
    });
    const [imageUrl, setImageUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function addImage() {
        const url = imageUrl.trim();
        if (!url) return;
        setForm((prev) => ({
            ...prev,
            images: [...prev.images, { url, publicId: "manual_" + Date.now() }],
        }));
        setImageUrl("");
    }

    function removeImage(index) {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create");

            router.push("/admin/products");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const categories = ["Aso-Oke", "Gele", "Damask", "Other"];

    return (
        <div className="max-w-xl mx-auto">
            <div className="backdrop-blur-md bg-white/80 border border-white/40 shadow-glass-sm rounded-glass-lg p-6">
                <h1 className="text-2xl font-semibold text-charcoal">
                    Add New Product
                </h1>
                <p className="text-sm text-soft-grey mt-1">
                    Add a new fabric to your catalog
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-glass-sm px-4 py-2">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-charcoal">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                            className="glass-input mt-1 w-full"
                            placeholder="e.g. Premium Aso-Oke Blue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }))
                            }
                            rows={4}
                            className="glass-input mt-1 w-full resize-none"
                            placeholder="Describe the fabric..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-charcoal">
                                Price (₦) *
                            </label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        price: e.target.value,
                                    }))
                                }
                                required
                                min="0"
                                className="glass-input mt-1 w-full"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal">
                                Category *
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        category: e.target.value,
                                    }))
                                }
                                className="glass-input mt-1 w-full"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.inStock}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        inStock: e.target.checked,
                                    }))
                                }
                                className="rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                            />
                            <span className="text-sm font-medium text-charcoal">
                                In Stock
                            </span>
                        </label>
                    </div>

                    {/* Image URLs */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal">
                            Image URLs
                        </label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="glass-input flex-1"
                                placeholder="Paste image URL..."
                            />
                            <button
                                type="button"
                                onClick={addImage}
                                className="glass-button-ghost text-sm"
                            >
                                Add
                            </button>
                        </div>
                        {form.images.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {form.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="relative w-20 h-20 rounded-glass-sm overflow-hidden border border-gray-200/50 group"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-bl-glass-sm opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-soft-grey mt-1">
                            Add image URLs manually. For Cloudinary upload, use
                            the upload API.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="glass-button-gold flex-1"
                        >
                            {saving ? "Saving..." : "Create Product"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="glass-button-ghost"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
