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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const [productsRes, categoriesRes] = await Promise.all([
        fetch(baseUrl + "/api/products?" + query.toString(), {
            cache: "no-store",
        }),
        fetch(baseUrl + "/api/categories", { cache: "no-store" }),
    ]);

    const productsData = await productsRes
        .json()
        .catch(() => ({ products: [] }));
    const categoriesData = await categoriesRes
        .json()
        .catch(() => ({ categories: [] }));
    const products = productsData?.products || [];
    const dbCategories = categoriesData?.categories || [];
    const categories = [
        "All",
        ...dbCategories.map((c) => c.displayName || c.name),
    ];

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
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-400 hover:to-amber-500 transition-all duration-300"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((c) => {
                    const isAll = c === "All";
                    const href = isAll
                        ? "/shop"
                        : `/shop?category=${encodeURIComponent(c)}`;
                    const isActive = isAll ? !category : category === c;
                    return (
                        <Link
                            key={c}
                            href={href}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-amber-500 text-white border-amber-500 shadow-md"
                                    : "bg-white/70 border-gray-200/50 text-soft-grey hover:text-charcoal hover:bg-white/90 hover:border-gray-300"
                            }`}
                        >
                            {c}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8">
                <p className="text-sm text-soft-grey">
                    {products.length} product{products.length !== 1 && "s"}{" "}
                    found
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => {
                        const price =
                            typeof p.price === "number"
                                ? p.price
                                : Number(p.price || 0);
                        const img = p.images?.[0]?.url;
                        const qty = Number(p.quantity) || 0;

                        return (
                            <Link key={p._id} href={"/shop/" + p._id}>
                                <GlassCard className="h-full hover:scale-[1.02] transition-all duration-300 group">
                                    <div className="rounded-xl overflow-hidden border border-gray-200/50 relative">
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={p.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                                No image
                                            </div>
                                        )}
                                        {qty > 0 && qty <= 5 && (
                                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold shadow-lg">
                                                Only {qty} left
                                            </span>
                                        )}
                                        {qty === 0 && (
                                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold shadow-lg">
                                                Out of stock
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200/50">
                                                {p.category}
                                            </span>
                                            {qty > 0 && (
                                                <span className="text-[10px] text-emerald-600 font-medium">
                                                    {qty} in stock
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-charcoal font-semibold text-lg leading-tight">
                                            {p.name}
                                        </h3>
                                        <p className="text-amber-600 font-bold text-xl">
                                            ₦{price.toLocaleString()}
                                        </p>
                                        <p className="text-soft-grey text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                            View details
                                            <span className="text-amber-500">
                                                →
                                            </span>
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
