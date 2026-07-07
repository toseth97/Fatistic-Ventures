import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";

export default async function ShopPage({ searchParams }) {
    const params = await Promise.resolve(searchParams);
    const q = params?.q || "";
    const category = params?.category || "";
    const inStock = params?.inStock;

    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    if (inStock) query.set("inStock", inStock);

    const res = await fetch(
        (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
            "/api/products?" +
            query.toString(),
        { cache: "no-store" },
    );

    const data = await res.json().catch(() => ({ products: [] }));
    const products = data?.products || [];

    const categories = ["Aso-Oke", "Gele", "Damask", "Other"];

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-charcoal">
                        Shop Fabrics
                    </h1>
                    <p className="text-sm text-soft-grey mt-1">
                        Browse our collection of premium Aso-Oke, Gele, and
                        Damask
                    </p>
                    <div className="mt-4">
                        <form
                            className="flex gap-3"
                            action="/shop"
                            method="get"
                        >
                            <input
                                name="q"
                                defaultValue={q}
                                placeholder="Search fabrics..."
                                className="glass-input flex-1"
                            />
                            <button type="submit" className="glass-button-gold">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <Link
                    href="/shop"
                    className={`px-3 py-2 rounded-glass-sm border text-sm font-medium transition-all ${
                        !category
                            ? "bg-gold-500/10 border-gold-500/30 text-gold-700"
                            : "bg-white/70 border-gray-200/50 text-soft-grey hover:text-charcoal hover:bg-white/90"
                    }`}
                >
                    All
                </Link>
                {categories.map((c) => (
                    <Link
                        key={c}
                        href={"/shop?category=" + encodeURIComponent(c)}
                        className={`px-3 py-2 rounded-glass-sm border text-sm font-medium transition-all ${
                            category === c
                                ? "bg-gold-500/10 border-gold-500/30 text-gold-700"
                                : "bg-white/70 border-gray-200/50 text-soft-grey hover:text-charcoal hover:bg-white/90"
                        }`}
                    >
                        {c}
                    </Link>
                ))}
            </div>

            <div className="mt-8">
                <p className="text-sm text-soft-grey">
                    {products.length} product{products.length !== 1 && "s"}{" "}
                    found
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => {
                        const price =
                            typeof p.price === "number"
                                ? p.price
                                : Number(p.price || 0);
                        const img = p.images?.[0]?.url;

                        return (
                            <Link key={p._id} href={"/shop/" + p._id}>
                                <GlassCard className="h-full hover:scale-[1.02] transition transform">
                                    <div className="rounded-glass-sm overflow-hidden border border-gray-200/50">
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={p.name}
                                                className="w-full h-44 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-44 bg-gray-100" />
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold-50 text-gold-700 font-medium">
                                            {p.category}
                                        </span>
                                        <h3 className="text-charcoal font-semibold mt-2">
                                            {p.name}
                                        </h3>
                                        <p className="text-gold-600 font-medium mt-1">
                                            ₦{price.toLocaleString()}
                                        </p>
                                        <p className="text-soft-grey text-sm mt-2">
                                            View details →
                                        </p>
                                    </div>
                                </GlassCard>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
