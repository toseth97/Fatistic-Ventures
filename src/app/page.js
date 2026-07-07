import Link from "next/link";
import HeroTextAnimator from "@/components/HeroTextAnimator";

export default function HomePage() {
    return (
        <main className="relative">
            {/* Hero Section */}
            <section className="relative w-full min-h-[75vh] overflow-hidden flex items-center pt-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-accent/10" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                <div className="relative mx-auto max-w-6xl px-4 w-full">
                    <div className="max-w-2xl">
                        <div className="glass-card p-8 md:p-10 inline-block">
                            <HeroTextAnimator
                                title="Fatistic Ventures"
                                subtitle="Aso-Oke Guru — Luxury | Quality | Elegance"
                                titleClassName="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-charcoal leading-tight"
                                subtitleClassName="mt-3 text-accent font-semibold text-lg tracking-wide"
                            />

                            <p className="mt-6 text-soft-grey max-w-xl leading-relaxed text-base">
                                Premium Nigerian fabrics — Aso-Oke, Gele, and
                                Damask — delivered nationwide and worldwide.
                                Discover the richness of Yoruba textile
                                heritage.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/shop"
                                    className="glass-button-gold"
                                >
                                    Shop Fabrics
                                </Link>
                                <Link
                                    href="/about"
                                    className="glass-button-ghost"
                                >
                                    Our Heritage
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3 flex-wrap">
                            {[
                                "Luxury Craft",
                                "Quality Fabrics",
                                "Worldwide Delivery",
                            ].map((t) => (
                                <div
                                    key={t}
                                    className="glass rounded-glass-sm px-4 py-2"
                                >
                                    <span className="text-sm font-medium text-charcoal">
                                        {t}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="mx-auto max-w-6xl px-4 py-16">
                <div className="text-center">
                    <h2 className="font-display text-3xl font-semibold text-charcoal">
                        Our Collections
                    </h2>
                    <p className="mt-2 text-soft-grey">
                        Curated picks for elegant celebrations
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            cat: "Aso-Oke",
                            desc: "Handwoven prestige fabrics with rich textures and cultural significance.",
                            icon: "🧵",
                            gradient: "from-gold-100 to-gold-50",
                        },
                        {
                            cat: "Gele",
                            desc: "Perfectly structured headwraps for timeless elegance and grace.",
                            icon: "👑",
                            gradient: "from-burgundy-50 to-pink-50",
                        },
                        {
                            cat: "Damask",
                            desc: "Luxurious woven patterns with standout presence for any occasion.",
                            icon: "✨",
                            gradient: "from-emerald-50 to-teal-50",
                        },
                    ].map((item) => (
                        <Link
                            key={item.cat}
                            href={`/shop?category=${encodeURIComponent(item.cat)}`}
                            className="glass-card-hover group p-6"
                        >
                            <div
                                className={`w-14 h-14 rounded-glass-sm bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl mb-4`}
                            >
                                {item.icon}
                            </div>
                            <h3 className="font-display text-xl font-semibold text-charcoal">
                                {item.cat}
                            </h3>
                            <p className="text-soft-grey text-sm mt-2 leading-relaxed">
                                {item.desc}
                            </p>
                            <div className="mt-4 text-gold-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                Explore Collection →
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-white/50 border-y border-gray-100">
                <div className="mx-auto max-w-6xl px-4 py-16">
                    <div className="text-center">
                        <h2 className="font-display text-3xl font-semibold text-charcoal">
                            What Our Customers Say
                        </h2>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "The Aso-Oke I ordered was absolutely stunning. The quality exceeded my expectations. Delivered right to my door in London!",
                                author: "Adebisi O.",
                                location: "London, UK",
                            },
                            {
                                quote: "Fatistic Ventures is my go-to for Gele. The craftsmanship is incredible and the colors are always vibrant.",
                                author: "Folake A.",
                                location: "Lagos, Nigeria",
                            },
                            {
                                quote: "I ordered Damask fabric for my wedding and it was perfect. Fast delivery and excellent customer service.",
                                author: "Chioma E.",
                                location: "Abuja, Nigeria",
                            },
                        ].map((t, i) => (
                            <div key={i} className="glass-card p-6">
                                <div className="text-gold-500 text-2xl mb-2">
                                    &ldquo;
                                </div>
                                <p className="text-soft-grey text-sm leading-relaxed">
                                    {t.quote}
                                </p>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-charcoal font-medium text-sm">
                                        {t.author}
                                    </p>
                                    <p className="text-soft-grey text-xs">
                                        {t.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-6xl px-4 py-16 text-center">
                <div className="glass-card p-10 max-w-2xl mx-auto">
                    <h2 className="font-display text-3xl font-semibold text-charcoal">
                        Ready to Elevate Your Style?
                    </h2>
                    <p className="mt-3 text-soft-grey">
                        Browse our collection of premium fabrics and find the
                        perfect piece for your next celebration.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link href="/shop" className="glass-button-gold">
                            Browse Collection
                        </Link>
                        <Link
                            href="https://wa.me/2348062572564"
                            target="_blank"
                            rel="noreferrer"
                            className="glass-button-ghost"
                        >
                            Chat on WhatsApp
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
