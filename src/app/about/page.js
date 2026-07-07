import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import HeroTextAnimator from "@/components/HeroTextAnimator";

export default function AboutPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-12">
            <div className="max-w-5xl mx-auto">
                <section className="relative rounded-glass-lg overflow-hidden border border-gray-200/50 bg-white/80 backdrop-blur-md shadow-glass-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-cream to-accent/10" />
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 20%, #B70B68 0%, transparent 55%), radial-gradient(circle at 80% 0%, #E6B800 0%, transparent 50%)",
                        }}
                    />

                    <div className="relative p-8 md:p-12 lg:p-14">
                        <HeroTextAnimator
                            title="Our Heritage"
                            subtitle="Luxury Nigerian fabrics — Aso-Oke, Gele & Damask"
                            titleClassName="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-charcoal leading-tight"
                            subtitleClassName="mt-3 text-accent font-semibold text-lg tracking-tight"
                        />

                        <p className="mt-6 text-soft-grey max-w-3xl leading-relaxed text-lg">
                            At Fatistic Ventures, we weave tradition and luxury
                            into every piece. From handwoven Aso-Oke to elegant
                            Gele and rich Damask, our textiles celebrate the
                            craftsmanship and timeless style of Nigerian
                            heritage.
                        </p>
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.28em] text-soft-grey font-semibold">
                                    Trusted quality since day one
                                </p>
                                <p className="mt-2 text-charcoal text-base">
                                    Sourcing authentically crafted fabrics and
                                    delivering them with care.
                                </p>
                            </div>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent/90 transition-colors"
                            >
                                Explore the collection
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                    {[
                        {
                            title: "Aso-Oke Mastery",
                            description:
                                "Artisan handwoven fabrics with rich texture and heritage detail.",
                            icon: "🧵",
                        },
                        {
                            title: "Gele Elegance",
                            description:
                                "Structured headwraps designed for a flawless finish and lasting beauty.",
                            icon: "👑",
                        },
                        {
                            title: "Damask Luxury",
                            description:
                                "Premium woven patterns with luxurious sheen and elegant depth.",
                            icon: "✨",
                        },
                    ].map((item) => (
                        <GlassCard key={item.title} className="p-8">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl text-accent mb-4">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-charcoal">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-soft-grey text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </GlassCard>
                    ))}
                </div>

                <div className="mt-10 rounded-glass-lg border border-gray-200/50 bg-white/80 p-8 shadow-glass-sm">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-soft-grey font-semibold">
                                Why choose us
                            </p>
                            <h2 className="mt-4 text-3xl font-display font-semibold text-charcoal">
                                Premium fabrics crafted for special moments.
                            </h2>
                        </div>
                        <div className="space-y-4 text-soft-grey">
                            <p>
                                We source the best materials from trusted mills
                                and artisans, then bring them directly to your
                                doorstep with fast nationwide and international
                                delivery.
                            </p>
                            <p>
                                Every order is carefully packaged to preserve
                                color, texture, and finish so your fabric
                                arrives ready for celebration.
                            </p>
                            <p>
                                Whether you need traditional wedding attire or
                                standout event styling, Fatistic Ventures makes
                                luxury Nigerian textiles easy to access.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-gray-200/50 pt-8 text-soft-grey">
                    <h2 className="text-lg font-semibold text-charcoal">
                        Our Story
                    </h2>
                    <p className="text-soft-grey mt-4 leading-relaxed">
                        Based at 1B, Araromi Street, Beside Kairo Market,
                        Oshodi, Lagos, Fatistic Ventures is your trusted source
                        for the finest Nigerian textiles. With years of
                        experience in the fabric trade, we connect customers
                        with authentic, high-quality materials that celebrate
                        Yoruba textile heritage.
                    </p>
                    <p className="text-soft-grey mt-4 leading-relaxed">
                        We deliver nationwide and worldwide, ensuring that
                        wherever you are, you can access the elegance and luxury
                        of premium Aso-Oke, perfectly draped Gele, and exquisite
                        Damask fabrics.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            title: "Aso-Oke Expertise",
                            description:
                                "Handpicked textures and rich finishes. Each piece tells a story of craftsmanship.",
                            icon: "🧵",
                        },
                        {
                            title: "Gele Elegance",
                            description:
                                "Designed for perfect drape and timeless style. Stand out at any occasion.",
                            icon: "👑",
                        },
                        {
                            title: "Damask Luxury",
                            description:
                                "Premium weaves with standout presence. Make a statement with every wear.",
                            icon: "✨",
                        },
                    ].map((item) => (
                        <GlassCard key={item.title} className="p-8">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl text-accent mb-4">
                                {item.icon}
                            </div>
                            <h3 className="text-charcoal font-semibold">
                                {item.title}
                            </h3>
                            <p className="text-soft-grey text-sm mt-2 leading-relaxed">
                                {item.description}
                            </p>
                        </GlassCard>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200/50">
                    <p className="text-soft-grey">
                        Ready to explore our collection?{" "}
                        <Link
                            href="/shop"
                            className="text-accent hover:text-accent/90 font-medium"
                        >
                            Visit the shop →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
