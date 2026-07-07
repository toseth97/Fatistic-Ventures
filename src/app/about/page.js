import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import HeroTextAnimator from "@/components/HeroTextAnimator";

export default function AboutPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="max-w-3xl mx-auto">
                <section className="relative rounded-glass-lg overflow-hidden border border-gray-200/50 bg-white/60 backdrop-blur-md shadow-glass-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-cream to-white" />
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 20%, #B70B68 0%, transparent 55%), radial-gradient(circle at 80% 0%, #E6B800 0%, transparent 50%)",
                        }}
                    />

                    <div className="relative p-8 md:p-10">
                        <HeroTextAnimator
                            title="Our Heritage"
                            subtitle="Luxury Nigerian fabrics — Aso-Oke, Gele & Damask"
                            titleClassName="font-display text-4xl sm:text-5xl font-semibold text-charcoal leading-tight"
                            subtitleClassName="mt-3 text-accent font-medium text-lg tracking-wide"
                        />

                        <p className="text-soft-grey mt-6 leading-relaxed text-lg">
                            Fatistic Ventures curates luxury Nigerian fabrics —
                            Aso-Oke, Gele, and Damask — for weddings,
                            celebrations, and elegant everyday statements.
                        </p>
                    </div>
                </section>

                <div className="mt-8 border-t border-gray-200/50 pt-8">
                    <h2 className="text-lg font-semibold text-charcoal">
                        Our Story
                    </h2>
                    <p className="text-soft-grey mt-2 leading-relaxed">
                        Based at 1B, Araromi Street, Beside Kairo Market,
                        Oshodi, Lagos, Fatistic Ventures is your trusted source
                        for the finest Nigerian textiles. With years of
                        expertise in the fabric trade, we pride ourselves on
                        connecting our customers with authentic, high-quality
                        materials that celebrate Yoruba textile heritage.
                    </p>
                    <p className="text-soft-grey mt-3 leading-relaxed">
                        We deliver nationwide and worldwide, ensuring that
                        wherever you are, you can access the elegance and luxury
                        of premium Aso-Oke, perfectly draped Gele, and exquisite
                        Damask fabrics.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            t: "Aso-Oke Expertise",
                            d: "Handpicked textures and rich finishes. Each piece tells a story of craftsmanship.",
                            icon: "🧵",
                        },
                        {
                            t: "Gele Elegance",
                            d: "Designed for perfect drape and timeless style. Stand out at any occasion.",
                            icon: "👑",
                        },
                        {
                            t: "Damask Luxury",
                            d: "Premium weaves with standout presence. Make a statement with every wear.",
                            icon: "✨",
                        },
                    ].map((x) => (
                        <GlassCard key={x.t}>
                            <div className="w-12 h-12 rounded-glass-sm bg-gradient-to-br from-white to-accent/10 border border-gray-200/50 flex items-center justify-center text-2xl mb-2">
                                {x.icon}
                            </div>
                            <h3 className="text-charcoal font-semibold">
                                {x.t}
                            </h3>
                            <p className="text-soft-grey text-sm mt-2">{x.d}</p>
                        </GlassCard>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200/50">
                    <p className="text-soft-grey">
                        Ready to explore our collection?{" "}
                        <Link
                            href="/shop"
                            className="text-gold-600 hover:text-gold-700 font-medium"
                        >
                            Visit the shop →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
