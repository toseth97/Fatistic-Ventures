"use client";

import { useEffect, useState } from "react";

// Content management for homepage hero, promo banners, site info and perks.
// Data is stored server-side in SiteSetting keys: hero | banners | site | perks.

const EMPTY_HERO = {
    headline: "",
    subheadline: "",
    image: "",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    secondaryCtaText: "Featured Collection",
    secondaryCtaLink: "/shop?featured=true",
};

const EMPTY_SITE = {
    phone: "",
    email: "",
    address: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
};

const EMPTY_BANNER = {
    title: "",
    subtitle: "",
    image: "",
    link: "/shop",
    ctaText: "Shop Now",
    active: true,
    sortOrder: 0,
};

export default function AdminContentPage() {
    const [hero, setHero] = useState(EMPTY_HERO);
    const [site, setSite] = useState(EMPTY_SITE);
    const [banners, setBanners] = useState([]);
    const [perks, setPerks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem("admin_token");
                const res = await fetch("/api/admin/settings", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load settings");
                const s = data.settings || {};
                setHero({ ...EMPTY_HERO, ...(s.hero || {}) });
                setSite({ ...EMPTY_SITE, ...(s.site || {}) });
                setBanners(Array.isArray(s.banners?.items) ? s.banners.items : []);
                setPerks(Array.isArray(s.perks?.items) ? s.perks.items : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function uploadImage(file, purpose) {
        if (!file) return "";
        setUploading(purpose);
        try {
            const token = localStorage.getItem("admin_token");
            const fd = new FormData();
            fd.append("file", file);
            fd.append("purpose", purpose);
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            return data.media?.url || data.url || "";
        } catch (err) {
            setError(err.message);
            return "";
        } finally {
            setUploading("");
        }
    }

    async function saveAll() {
        setSaving(true);
        setMessage("");
        setError("");
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    settings: {
                        hero,
                        site,
                        banners: { items: banners },
                        perks: { items: perks },
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            setMessage("Content saved — the storefront updates immediately.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const inputCls =
        "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-charcoal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20";

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-charcoal">Website Content</h1>
                    <p className="mt-1 text-sm text-soft-grey">
                        Edit what visitors see on the homepage — no code needed
                    </p>
                </div>
                <button
                    type="button"
                    onClick={saveAll}
                    disabled={saving || loading}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                    {saving ? "Saving…" : "Save all changes"}
                </button>
            </div>

            {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    <div className="h-48 animate-pulse rounded-2xl bg-gray-200/60" />
                    <div className="h-64 animate-pulse rounded-2xl bg-gray-200/60" />
                </div>
            ) : (
                <>
                    {/* ------------------------------ HERO ------------------------------ */}
                    <section className="rounded-2xl border border-gray-200/60 bg-white/90 p-6 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-soft-grey">
                            Homepage hero
                        </h2>
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            <label className="text-xs font-medium text-soft-grey">
                                Headline
                                <input
                                    value={hero.headline}
                                    onChange={(e) => setHero((h) => ({ ...h, headline: e.target.value }))}
                                    maxLength={160}
                                    className={`mt-1 ${inputCls}`}
                                    placeholder="Luxury Nigerian Fabrics, Woven for Royalty"
                                />
                            </label>
                            <label className="text-xs font-medium text-soft-grey">
                                Supporting text
                                <textarea
                                    value={hero.subheadline}
                                    onChange={(e) => setHero((h) => ({ ...h, subheadline: e.target.value }))}
                                    maxLength={300}
                                    rows={2}
                                    className={`mt-1 ${inputCls}`}
                                    placeholder="Premium Aso-Oke, Gele, Ankara…"
                                />
                            </label>
                            <label className="text-xs font-medium text-soft-grey">
                                Primary CTA text
                                <input
                                    value={hero.ctaText}
                                    onChange={(e) => setHero((h) => ({ ...h, ctaText: e.target.value }))}
                                    maxLength={60}
                                    className={`mt-1 ${inputCls}`}
                                />
                            </label>
                            <label className="text-xs font-medium text-soft-grey">
                                Primary CTA link
                                <input
                                    value={hero.ctaLink}
                                    onChange={(e) => setHero((h) => ({ ...h, ctaLink: e.target.value }))}
                                    maxLength={200}
                                    className={`mt-1 ${inputCls}`}
                                    placeholder="/shop"
                                />
                            </label>
                            <label className="text-xs font-medium text-soft-grey">
                                Secondary CTA text
                                <input
                                    value={hero.secondaryCtaText}
                                    onChange={(e) => setHero((h) => ({ ...h, secondaryCtaText: e.target.value }))}
                                    maxLength={60}
                                    className={`mt-1 ${inputCls}`}
                                />
                            </label>
                            <label className="text-xs font-medium text-soft-grey">
                                Secondary CTA link
                                <input
                                    value={hero.secondaryCtaLink}
                                    onChange={(e) => setHero((h) => ({ ...h, secondaryCtaLink: e.target.value }))}
                                    maxLength={200}
                                    className={`mt-1 ${inputCls}`}
                                />
                            </label>
                        </div>
                        <div className="mt-3">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-charcoal hover:border-amber-400">
                                {uploading === "hero" ? "Uploading…" : "⬆ Upload hero image"}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const url = await uploadImage(e.target.files?.[0], "hero");
                                        if (url) setHero((h) => ({ ...h, image: url }));
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                            {hero.image && (
                                <p className="mt-1 truncate text-xs text-soft-grey">{hero.image}</p>
                            )}
                        </div>
                    </section>

                    {/* ------------------------------ BANNERS ------------------------------ */}
                    <section className="rounded-2xl border border-gray-200/60 bg-white/90 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-soft-grey">
                                Promotional banners
                            </h2>
                            <button
                                type="button"
                                onClick={() => setBanners((b) => [...b, { ...EMPTY_BANNER, sortOrder: b.length }])}
                                className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-medium text-charcoal hover:border-amber-400"
                            >
                                + Add banner
                            </button>
                        </div>

                        {banners.length === 0 ? (
                            <p className="mt-4 text-sm text-soft-grey">
                                No banners yet. Add one to promote a collection or sale.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {banners.map((b, i) => (
                                    <div key={i} className="rounded-xl border border-gray-200 p-4">
                                        <div className="grid gap-3 lg:grid-cols-2">
                                            <label className="text-xs font-medium text-soft-grey">
                                                Title
                                                <input
                                                    value={b.title || ""}
                                                    onChange={(e) =>
                                                        setBanners((arr) => arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                                                    }
                                                    maxLength={160}
                                                    className={`mt-1 ${inputCls}`}
                                                />
                                            </label>
                                            <label className="text-xs font-medium text-soft-grey">
                                                Subtitle
                                                <input
                                                    value={b.subtitle || ""}
                                                    onChange={(e) =>
                                                        setBanners((arr) => arr.map((x, j) => (j === i ? { ...x, subtitle: e.target.value } : x)))
                                                    }
                                                    maxLength={300}
                                                    className={`mt-1 ${inputCls}`}
                                                />
                                            </label>

                                            <label className="text-xs font-medium text-soft-grey">
                                                Link
                                                <input
                                                    value={b.link || ""}
                                                    onChange={(e) =>
                                                        setBanners((arr) => arr.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))
                                                    }
                                                    maxLength={500}
                                                    className={`mt-1 ${inputCls}`}
                                                    placeholder="/shop?featured=true"
                                                />
                                            </label>
                                            <label className="text-xs font-medium text-soft-grey">
                                                CTA text
                                                <input
                                                    value={b.ctaText || ""}
                                                    onChange={(e) =>
                                                        setBanners((arr) => arr.map((x, j) => (j === i ? { ...x, ctaText: e.target.value } : x)))
                                                    }
                                                    maxLength={60}
                                                    className={`mt-1 ${inputCls}`}
                                                />
                                            </label>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-4">
                                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-charcoal hover:border-amber-400">
                                                {uploading === `banner-${i}` ? "Uploading…" : "⬆ Upload image"}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const url = await uploadImage(e.target.files?.[0], "banner");
                                                        if (url)
                                                            setBanners((arr) =>
                                                                arr.map((x, j) => (j === i ? { ...x, image: url } : x)),
                                                            );
                                                        e.target.value = "";
                                                    }}
                                                />
                                            </label>
                                            <label className="flex items-center gap-2 text-xs font-medium text-charcoal">
                                                <input
                                                    type="checkbox"
                                                    checked={b.active !== false}
                                                    onChange={(e) =>
                                                        setBanners((arr) =>
                                                            arr.map((x, j) => (j === i ? { ...x, active: e.target.checked } : x)),
                                                        )
                                                    }
                                                    className="accent-amber-500"
                                                />
                                                Active
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setBanners((arr) => arr.filter((_, j) => j !== i))}
                                                className="text-xs font-medium text-red-500 hover:underline"
                                            >
                                                Remove banner
                                            </button>
                                        </div>
                                        {b.image && <p className="mt-2 truncate text-xs text-soft-grey">{b.image}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ------------------------------ SITE INFO ------------------------------ */}
                    <section className="rounded-2xl border border-gray-200/60 bg-white/90 p-6 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-soft-grey">
                            Contact &amp; social links (footer)
                        </h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                ["phone", "Phone"],
                                ["email", "Email"],
                                ["address", "Address"],
                                ["whatsapp", "WhatsApp number"],
                                ["instagram", "Instagram URL"],
                                ["facebook", "Facebook URL"],
                                ["twitter", "Twitter/X URL"],
                                ["tiktok", "TikTok URL"],
                            ].map(([key, label]) => (
                                <label key={key} className="text-xs font-medium text-soft-grey">
                                    {label}
                                    <input
                                        value={site[key] || ""}
                                        onChange={(e) => setSite((s) => ({ ...s, [key]: e.target.value }))}
                                        maxLength={200}
                                        className={`mt-1 ${inputCls}`}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}





