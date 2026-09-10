import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/ProductCard";

export const metadata = {
    title: "Shop Premium Fabrics",
    description:
        "Browse premium Nigerian fabrics — Aso-Oke, Gele, Ankara, Lace, Damask and more. Filter by category, price and availability.",
    alternates: { canonical: "/shop" },
};

const PAGE_SIZE = 12;

const SORTS = {
    newest: { createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
    name_asc: { name: 1 },
};

const SORT_LABELS = {
    newest: "Newest",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    name_asc: "Name A–Z",
};

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

async function getShopData(sp) {
    const q = String(sp?.q || "").trim().slice(0, 100);
    const category = String(sp?.category || "").trim().slice(0, 100);
    const minPrice = toNum(sp?.minPrice);
    const maxPrice = toNum(sp?.maxPrice);
    const inStockOnly = sp?.availability === "in_stock";
    const featuredOnly = sp?.featured === "true";
    const sort = SORTS[sp?.sort] ? sp.sort : "newest";
    const page = Math.max(1, toNum(sp?.page) || 1);

    const filter = { published: true };
    if (featuredOnly) filter.featured = true;
    if (inStockOnly) filter.inStock = true;
    if (minPrice > 0 || maxPrice > 0) {
        filter.price = {};
        if (minPrice > 0) filter.price.$gte = minPrice;
        if (maxPrice > 0) filter.price.$lte = maxPrice;
    }

    let activeCategory = null;
    try {
        await connectDB();
        if (category) {
            activeCategory = await Category.findOne({
                $or: [{ slug: category }, { name: category.toLowerCase() }],
            }).lean();
            if (activeCategory) {
                filter.$or = [
                    { categoryId: activeCategory._id },
                    { category: activeCategory.name },
                    { category: activeCategory.displayName },
                ];
            } else {
                filter.category = category;
            }
        }
        if (q) {
            const rx = new RegExp(escapeRegex(q), "i");
            filter.$and = [{ $or: [{ name: rx }, { description: rx }, { category: rx }] }];
        }

        const [total, products, categories] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .sort(SORTS[sort])
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .lean(),
            Category.find({ published: true })
                .sort({ sortOrder: 1, createdAt: 1 })
                .lean(),
        ]);

        return { q, category, minPrice, maxPrice, inStockOnly, featuredOnly, sort, page, total, products, categories };
    } catch {
        return {
            q, category, minPrice, maxPrice, inStockOnly, featuredOnly, sort, page,
            total: 0, products: [], categories: [],
        };
    }
}

function buildQuery({ q, category, minPrice, maxPrice, availability, featured, sort, page }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice) params.set("maxPrice", String(maxPrice));
    if (availability) params.set("availability", availability);
    if (featured) params.set("featured", "true");
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page && page > 1) params.set("page", String(page));
    const s = params.toString();
    return s ? `/shop?${s}` : "/shop";
}

export default async function ShopPage({ searchParams }) {
    const sp = (await Promise.resolve(searchParams)) || {};
    const d = await getShopData(sp);
    const pages = Math.ceil(d.total / PAGE_SIZE);
    const activeCat = d.categories.find(
        (c) => (c.slug || c.name) === d.category || c.name === d.category?.toLowerCase(),
    );

    return (
        <main className="shell py-10">
            {/* Page head + search */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="eyebrow">The collection</p>
                    <h1 className="section-title mt-2">
                        {activeCat ? activeCat.displayName || activeCat.name : "Shop All Fabrics"}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-soft-grey">
                        {activeCat?.description ||
                            "Premium Aso-Oke, Gele, Ankara, Lace, Damask and more — filter to find your perfect fabric."}
                    </p>
                </div>
                <form action="/shop" method="get" className="flex w-full max-w-md gap-2" role="search">
                    {d.category && <input type="hidden" name="category" value={d.category} />}
                    <input
                        type="search"
                        name="q"
                        defaultValue={d.q}
                        maxLength={100}
                        placeholder="Search fabrics…"
                        className="input"
                        aria-label="Search fabrics"
                    />
                    <button type="submit" className="btn btn-primary shrink-0">
                        Search
                    </button>
                </form>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
                {/* ------------------------------ FILTERS ------------------------------ */}
                <aside>
                    <details className="card-flat rounded-2xl lg:open" open>
                        <summary className="cursor-pointer select-none px-5 py-4 font-semibold text-ink lg:cursor-default">
                            Filters
                        </summary>
                        <form action="/shop" method="get" className="space-y-6 px-5 pb-5">
                            {d.q && <input type="hidden" name="q" value={d.q} />}

                            {/* Category */}
                            <div>
                                <p className="label">Category</p>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-sm text-ink">
                                        <input type="radio" name="category" value="" defaultChecked={!d.category} className="accent-brand" />
                                        All fabrics
                                    </label>
                                    {d.categories.map((c) => (
                                        <label key={c._id} className="flex items-center gap-2 text-sm text-ink">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={c.slug || c.name}
                                                defaultChecked={d.category === (c.slug || c.name)}
                                                className="accent-brand"
                                            />
                                            {c.displayName || c.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <p className="label">Price (₦)</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        name="minPrice"
                                        min="0"
                                        defaultValue={d.minPrice || ""}
                                        placeholder="Min"
                                        className="input py-2"
                                        aria-label="Minimum price"
                                    />
                                    <span className="text-soft-grey">–</span>
                                    <input
                                        type="number"
                                        name="maxPrice"
                                        min="0"
                                        defaultValue={d.maxPrice || ""}
                                        placeholder="Max"
                                        className="input py-2"
                                        aria-label="Maximum price"
                                    />
                                </div>
                            </div>

                            {/* Availability */}
                            <div>
                                <p className="label">Availability</p>
                                <label className="flex items-center gap-2 text-sm text-ink">
                                    <input
                                        type="checkbox"
                                        name="availability"
                                        value="in_stock"
                                        defaultChecked={d.inStockOnly}
                                        className="accent-brand"
                                    />
                                    In stock only
                                </label>
                                <label className="mt-1.5 flex items-center gap-2 text-sm text-ink">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        value="true"
                                        defaultChecked={d.featuredOnly}
                                        className="accent-brand"
                                    />
                                    Featured only
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary btn-sm flex-1">
                                    Apply
                                </button>
                                <Link href={d.q ? `/shop?q=${encodeURIComponent(d.q)}` : "/shop"} className="btn btn-outline btn-sm">
                                    Reset
                                </Link>
                            </div>
                        </form>
                    </details>
                </aside>

                {/* ------------------------------ RESULTS ------------------------------ */}
                <section aria-label="Products">
                    <div className="card-flat mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
                        <p className="text-sm text-soft-grey">
                            <span className="font-semibold text-ink">{d.total}</span>{" "}
                            fabric{d.total === 1 ? "" : "s"}
                            {d.q ? ` matching “${d.q}”` : ""}
                        </p>
                        <form action="/shop" method="get" className="flex items-center gap-2">
                            {d.q && <input type="hidden" name="q" value={d.q} />}
                            {d.category && <input type="hidden" name="category" value={d.category} />}
                            {d.minPrice ? <input type="hidden" name="minPrice" value={d.minPrice} /> : null}
                            {d.maxPrice ? <input type="hidden" name="maxPrice" value={d.maxPrice} /> : null}
                            {d.inStockOnly && <input type="hidden" name="availability" value="in_stock" />}
                            {d.featuredOnly && <input type="hidden" name="featured" value="true" />}
                            <label htmlFor="sort" className="text-xs text-soft-grey">Sort by</label>
                            <select id="sort" name="sort" defaultValue={d.sort} className="input w-auto py-1.5 text-sm">
                                {Object.entries(SORT_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-ghost btn-sm">Go</button>
                        </form>
                    </div>

                    {d.products.length === 0 ? (
                        <div className="empty-state card rounded-2xl">
                            <span className="icon" aria-hidden="true">🔎</span>
                            <p className="font-semibold text-ink">No fabrics found</p>
                            <p className="mt-1 max-w-sm text-sm text-soft-grey">
                                Try adjusting your search or removing some filters.
                            </p>
                            <Link href="/shop" className="btn btn-primary btn-sm mt-4">
                                Clear all filters
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
                            {d.products.map((p, i) => (
                                <ProductCard key={p._id} product={p} priority={i < 3} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pages > 1 && (
                        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                            {d.page > 1 && (
                                <Link
                                    href={buildQuery({ ...d, page: d.page - 1 })}
                                    className="btn btn-outline btn-sm"
                                    rel="prev"
                                >
                                    ← Previous
                                </Link>
                            )}
                            {Array.from({ length: pages }, (_, i) => i + 1)
                                .filter((n) => n === 1 || n === pages || Math.abs(n - d.page) <= 1)
                                .map((n, idx, arr) => (
                                    <span key={n} className="flex items-center gap-2">
                                        {idx > 0 && arr[idx - 1] !== n - 1 && (
                                            <span className="text-soft-grey">…</span>
                                        )}
                                        <Link
                                            href={buildQuery({ ...d, page: n })}
                                            aria-current={n === d.page ? "page" : undefined}
                                            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium ${
                                                n === d.page
                                                    ? "bg-brand text-white"
                                                    : "border border-border text-ink hover:border-brand hover:text-brand"
                                            }`}
                                        >
                                            {n}
                                        </Link>
                                    </span>
                                ))}
                            {d.page < pages && (
                                <Link
                                    href={buildQuery({ ...d, page: d.page + 1 })}
                                    className="btn btn-outline btn-sm"
                                    rel="next"
                                >
                                    Next →
                                </Link>
                            )}
                        </nav>
                    )}
                </section>
            </div>
        </main>
    );
}



