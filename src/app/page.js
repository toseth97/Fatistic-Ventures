import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SiteSetting from "@/models/SiteSetting";
import ProductCard from "@/components/ProductCard";

export const metadata = {
    alternates: { canonical: "/" },
};

const DEFAULT_HERO = {
    headline: "Luxury Nigerian Fabrics, Woven for Royalty",
    subheadline:
        "Premium Aso-Oke, Gele, Ankara, Lace and Damask — hand-picked in Lagos and delivered nationwide and worldwide.",
    image: "",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    secondaryCtaText: "Featured Collection",
    secondaryCtaLink: "/shop?featured=true",
};

const TESTIMONIALS = [
    {
        quote:
            "The Aso-Oke I ordered was absolutely stunning. The quality exceeded my expectations — delivered right to my door in London.",
        author: "Adebisi O.",
        location: "London, UK",
    },
    {
        quote:
            "Fatistic Ventures is my go-to for Gele. The craftsmanship is incredible and the colours are always vibrant.",
        author: "Folake A.",
        location: "Lagos, Nigeria",
    },
    {
        quote:
            "I ordered Damask fabric for my wedding and it was perfect. Fast delivery and excellent customer service.",
        author: "Chioma E.",
        location: "Abuja, Nigeria",
    },
];

async function getHomeData() {
    try {
        await connectDB();
        const [categories, featured, heroDoc, bannersDoc] = await Promise.all([
            Category.find({ published: true })
                .sort({ featured: -1, sortOrder: 1, createdAt: 1 })
                .limit(8)
                .lean(),
            Product.find({ published: true, featured: true })
                .sort({ createdAt: -1 })
                .limit(8)
                .lean(),
            SiteSetting.findOne({ key: "hero" }).lean(),
            SiteSetting.findOne({ key: "banners" }).lean(),
        ]);
        const banners = (bannersDoc?.value?.items || [])
            .filter((b) => b && b.active !== false)
            .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
            .slice(0, 3);
        return {
            categories: categories || [],
            featured: featured || [],
            hero: { ...DEFAULT_HERO, ...(heroDoc?.value || {}) },
            banners,
        };
    } catch {
        return {
            categories: [],
            featured: [],
            hero: DEFAULT_HERO,
            banners: [],
        };
    }
}

export default async function HomePage() {
    const { categories, featured, hero, banners } = await getHomeData();

    return (
        <main>
            {/* ------------------------------ HERO ------------------------------ */}
            <section className="relative overflow-hidden bg-surface-2">
                <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
                    <div>
                        <p className="eyebrow">Aso-Oke Guru · Luxury · Quality · Elegance</p>
                        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
                            {hero.headline}
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-soft-grey sm:text-lg">
                            {hero.subheadline}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href={hero.ctaLink || "/shop"} className="btn btn-primary btn-lg">
                                {hero.ctaText || "Shop Now"}
                            </Link>
                            <Link href={hero.secondaryCtaLink || "/shop?featured=true"} className="btn btn-outline btn-lg">
                                {hero.secondaryCtaText || "Featured Collection"}
                            </Link>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-6 text-sm text-soft-grey">
                            {["Worldwide delivery", "Authentic fabrics", "Secure payments"].map((t) => (
                                <span key={t} className="flex items-center gap-1.5">
                                    <span className="text-success">✓</span> {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-white shadow-xl sm:aspect-[5/4] lg:aspect-[4/5]">
                            {hero.image ? (
                                <Image
                                    src={hero.image}
                                    alt="Premium Nigerian fabrics"
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-burgundy-100 via-cream to-gold-100 text-center">
                                    <span className="text-6xl" aria-hidden="true">🧵</span>
                                    <p className="mt-4 max-w-[16rem] font-display text-2xl font-semibold text-burgundy-800">
                                        Woven heritage, modern elegance
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-border bg-white/95 px-5 py-4 shadow-lg backdrop-blur sm:block">
                            <p className="font-display text-2xl font-bold text-brand">500+</p>
                            <p className="text-xs text-soft-grey">Happy customers styled</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------ PROMO BANNERS (CMS) ------------------------ */}
            {banners.length > 0 && (
                <section className="container-x py-12" aria-label="Promotions">
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {banners.map((b, i) => (
                            <Link
                                key={i}
                                href={b.link || "/shop"}
                                className="group relative flex min-h-44 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-ink p-6 text-white shadow-sm transition-shadow hover:shadow-lg"
                            >
                                {b.image ? (
                                    <Image
                                        src={b.image}
                                        alt=""
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
                                <div className="relative">
                                    <p className="font-display text-xl font-semibold">{b.title}</p>
                                    {b.subtitle ? (
                                        <p className="mt-1 line-clamp-2 text-sm text-white/80">{b.subtitle}</p>
                                    ) : null}
                                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold-300">
                                        {b.ctaText || "Shop Now"} →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ------------------------ FEATURED CATEGORIES ------------------------ */}
            {categories.length > 0 && (
                <section className="container-x py-12" aria-label="Fabric categories">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="eyebrow">Browse by fabric</p>
                            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                                Our Collections
                            </h2>
                        </div>
                        <Link href="/shop" className="hidden shrink-0 text-sm font-medium text-brand hover:underline sm:block">
                            View all →
                        </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {categories.map((c) => (
                            <Link
                                key={c._id}
                                href={`/shop?category=${encodeURIComponent(c.slug || c.name)}`}
                                className="group card overflow-hidden"
                            >
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
                                    {c.image?.url ? (
                                        <Image
                                            src={c.image.url}
                                            alt={c.displayName || c.name}
                                            fill
                                            sizes="(max-width: 640px) 50vw, 25vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-gold-100">
                                            <span className="text-3xl" aria-hidden="true">🧶</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="font-medium text-ink group-hover:text-brand transition-colors">
                                        {c.displayName || c.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-soft-grey">
                                        {c.productCount > 0
                                            ? `${c.productCount} style${c.productCount > 1 ? "s" : ""}`
                                            : "Explore collection"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ------------------------ FEATURED PRODUCTS ------------------------ */}
            <section className="container-x py-12" aria-label="Featured fabrics">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="eyebrow">Hand-picked for you</p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                            Featured Fabrics
                        </h2>
                    </div>
                    <Link href="/shop?featured=true" className="hidden shrink-0 text-sm font-medium text-brand hover:underline sm:block">
                        Shop featured →
                    </Link>
                </div>

                {featured.length === 0 ? (
                    <div className="empty-state card mt-8">
                        <span className="icon" aria-hidden="true">🧵</span>
                        <p className="font-medium text-ink">No featured fabrics yet</p>
                        <p className="mt-1 max-w-sm text-sm text-soft-grey">
                            Our collection is being curated. Check back soon, or explore the full shop.
                        </p>
                        <Link href="/shop" className="btn btn-primary btn-sm mt-4">
                            Browse all fabrics
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                        {featured.map((p) => (
                            <ProductCard key={p._id} product={p} priority={false} />
                        ))}
                    </div>
                )}
            </section>

            {/* ------------------------ TESTIMONIALS ------------------------ */}
            <section className="bg-surface-2 py-14" aria-label="Customer testimonials">
                <div className="container-x">
                    <div className="text-center">
                        <p className="eyebrow">Loved by customers worldwide</p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                            What Our Customers Say
                        </h2>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {TESTIMONIALS.map((t) => (
                            <figure key={t.author} className="card p-6">
                                <div className="text-gold-500" aria-hidden="true">★★★★★</div>
                                <blockquote className="mt-3 text-sm leading-relaxed text-soft-grey">
                                    “{t.quote}”
                                </blockquote>
                                <figcaption className="mt-4 border-t border-border pt-4">
                                    <p className="text-sm font-semibold text-ink">{t.author}</p>
                                    <p className="text-xs text-soft-grey">{t.location}</p>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* ------------------------ CTA ------------------------ */}
            <section className="container-x py-14">
                <div className="card-brand relative overflow-hidden rounded-3xl px-6 py-14 text-center">
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                    <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold-400/20 blur-2xl" aria-hidden="true" />
                    <div className="relative mx-auto max-w-2xl">
                        <h2 className="font-display text-3xl font-bold sm:text-4xl">
                            Ready to Elevate Your Style?
                        </h2>
                        <p className="mt-3 text-white/85">
                            Browse our collection of premium fabrics and find the perfect
                            piece for your next celebration.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <Link href="/shop" className="btn btn-lg bg-white text-ink hover:bg-gold-50">
                                Browse Collection
                            </Link>
                            <a
                                href="https://wa.me/2348062572564"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-lg border border-white/40 text-white hover:bg-white/10"
                            >
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}



