"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "Aso-Oke",
        inStock: true,
        images: [],
    });
    const [categories, setCategories] = useState([
        "Aso-Oke",
        "Gele",
        "Damask",
        "Other",
    ]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (data?.categories?.length) {
                const names = data.categories.map(
                    (c) => c.displayName || c.name,
                );
                setCategories([...new Set([...names, "Other"])]);
            }
        } catch {
            // keep defaults
        }
    }

    async function handleImageUpload(file) {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setForm((prev) => ({
                ...prev,
                images: [
                    ...prev.images,
                    { url: data.url, publicId: data.publicId },
                ],
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    function handleFileChange(e) {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => handleImageUpload(file));
        e.target.value = "";
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        files.forEach((file) => handleImageUpload(file));
    }

    function handleDragOver(e) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleDragLeave() {
        setDragOver(false);
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
                    quantity: Number(form.quantity) || 0,
                    inStock:
                        form.inStock && (Number(form.quantity) > 0 || true),
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

    return (
        <div className="max-w-2xl mx-auto">
            <div className="backdrop-blur-md bg-white/80 border border-gray-200/60 shadow-lg rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg">
                        +
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-charcoal">
                            Add New Product
                        </h1>
                        <p className="text-sm text-soft-grey">
                            Fill in the details below to add a new fabric to
                            your catalog
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                            <svg
                                className="w-4 h-4 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1.5">
                            Product Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                            placeholder="e.g. Premium Aso-Oke Blue"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1.5">
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
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
                            placeholder="Describe the fabric..."
                        />
                    </div>

                    {/* Price & Quantity row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1.5">
                                Price (₦){" "}
                                <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm">
                                    ₦
                                </span>
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
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1.5">
                                Quantity
                            </label>
                            <input
                                type="number"
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        quantity: e.target.value,
                                    }))
                                }
                                min="0"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1.5">
                            Category <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    category: e.target.value,
                                }))
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* In Stock toggle */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.inStock}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        inStock: e.target.checked,
                                    }))
                                }
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-400/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                        <span className="text-sm font-medium text-charcoal">
                            In Stock
                        </span>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1.5">
                            Product Images
                        </label>

                        {/* Drop zone */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                                dragOver
                                    ? "border-amber-400 bg-amber-50"
                                    : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                            }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-500">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                        />
                                    </svg>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium text-amber-600">
                                        Click to upload
                                    </span>{" "}
                                    or drag and drop
                                </div>
                                <p className="text-xs text-gray-400">
                                    PNG, JPG, WebP up to 10MB
                                </p>
                            </div>
                        </div>

                        {/* Upload progress */}
                        {uploading && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Uploading image...
                            </div>
                        )}

                        {/* Image previews */}
                        {form.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {form.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="flex-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-400 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="w-4 h-4 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Create Product"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
