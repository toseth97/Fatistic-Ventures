"use client";

import { useState, useEffect } from "react";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newName, setNewName] = useState("");
    const [newDisplayName, setNewDisplayName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setCategories(data.categories || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddCategory(e) {
        e.preventDefault();
        if (!newName.trim()) return;

        setSaving(true);
        setError("");

        try {
            const token = localStorage.getItem("admin_token");
            const displayName = newDisplayName.trim() || newName.trim();
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newName.trim(),
                    displayName,
                }),
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || "Failed to add category");

            // Refresh the list and reset form
            await fetchCategories();
            setNewName("");
            setNewDisplayName("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-200/50 rounded-lg animate-pulse" />
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-14 bg-gray-200/50 rounded-xl animate-pulse"
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
                        Categories
                    </h1>
                    <p className="text-sm text-soft-grey mt-1">
                        {categories.length} categor
                        {categories.length === 1 ? "y" : "ies"} total
                    </p>
                </div>
            </div>

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

            {/* Add Category Form */}
            <div className="backdrop-blur-md bg-white/80 border border-gray-200/60 shadow-lg rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                    Add New Category
                </h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1.5">
                                Category Name{" "}
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                                placeholder="e.g. Aso-Oke"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1.5">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={newDisplayName}
                                onChange={(e) =>
                                    setNewDisplayName(e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                                placeholder="e.g. Aso Oke"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving || !newName.trim()}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-400 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                                Adding...
                            </span>
                        ) : (
                            "Add Category"
                        )}
                    </button>
                </form>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
                {categories.length === 0 ? (
                    <div className="backdrop-blur-md bg-white/80 border border-gray-200/60 shadow-sm rounded-2xl p-8 text-center">
                        <div className="text-4xl mb-3">📂</div>
                        <p className="text-soft-grey">
                            No categories yet. Add your first category above.
                        </p>
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div
                            key={cat._id}
                            className="backdrop-blur-md bg-white/80 border border-gray-200/60 shadow-sm rounded-xl p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 font-semibold text-sm">
                                    {cat.displayName?.[0] ||
                                        cat.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-charcoal">
                                        {cat.displayName || cat.name}
                                    </div>
                                    <div className="text-xs text-soft-grey">
                                        {cat.name}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-soft-grey">
                                Added{" "}
                                {new Date(cat.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
