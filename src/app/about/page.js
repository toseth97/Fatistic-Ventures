import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "About Us",
    description:
        "Fatistic Ventures — the Aso-Oke Guru. Premium Nigerian fabrics hand-picked in Lagos and delivered worldwide.",
    alternates: { canonical: "/about" },
};

const VALUES = [
    {
        icon: "🧵",
        title: "Authentic Craft",
        text: "Every fabric is sourced directly from trusted weavers and suppliers across Nigeria.",
    },
    {
        icon: "✨",
        title: "Uncompromising Quality",
        text: "We hand-inspect each piece — only fabrics we would wear ourselves make the collection.",
    },
    {
        icon: "🌍",
        title: "Worldwide Delivery",
        text: "From Lagos to London, we package and deliver your fabrics with care, wherever you are.",
    },
    {
        icon: "💬",
        title: "Personal Service",
        text: "Questions about styling or quantity? Our team is one WhatsApp message away.",
    },
];

export default function AboutPage() {
    return (
        <main className="shell py-12">
            {/* Hero */}
            <section className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                    <p className="eyebrow">Our story</p>
                    <h1 className="section-title mt-3">
                        The Aso-Oke Guru — Luxury, Quality &amp; Elegance
                    </h1>
                    <p className="prose-safe mt-5 text-base leading-relaxed text-soft-grey">
                        Fatistic Ventures began with a simple love for Nigerian
                        textiles — the rich textures of Aso-Oke, the drape of a
                        perfect Gele, and the celebration woven into every thread.
                        What started as a passion has grown into a destination for
                        premium fabrics, trusted by customers across Nigeria and
                        around the world.
                    </p>
                    <p className="prose-safe mt-4 text-base leading-relaxed text-soft-grey">
                        We curate every collection personally — Aso-Oke, Gele,
                        Ankara, Lace, Damask and more — so that whether it&apos;s
                        your wedding, a naming ceremony, or everyday elegance, you
                        wear something truly special.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/shop" className="btn btn-primary btn-md">Shop the collection</Link>
                        <Link href="/contact" className="btn btn-outline btn-md">Get in touch</Link>
                    </div>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-burgundy-100 via-cream to-gold-100">
                    <div className="flex h-full w-full flex-col items-center justify-center text-center">
                        <span className="text-7xl" aria-hidden="true">👑</span>
                        <p className="mt-4 max-w-[18rem] font-display text-2xl font-semibold text-burgundy-800">
                            Woven heritage, modern elegance
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="mt-16" aria-label="Our values">
                <div className="section-head">
                    <div>
                        <p className="eyebrow">Why shop with us</p>
                        <h2 className="section-title mt-1">What we stand for</h2>
                    </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {VALUES.map((v) => (
                        <div key={v.title} className="card rounded-2xl p-6">
                            <span className="text-3xl" aria-hidden="true">{v.icon}</span>
                            <h3 className="mt-3 font-semibold text-ink">{v.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-soft-grey">{v.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="mt-16 rounded-3xl bg-ink px-6 py-12 text-center text-white" aria-label="Store highlights">
                <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
                    {[
                        ["500+", "Happy customers"],
                        ["100%", "Authentic fabrics"],
                        ["🌍", "Worldwide delivery"],
                    ].map(([value, label]) => (
                        <div key={label}>
                            <p className="font-display text-4xl font-bold text-gold-300">{value}</p>
                            <p className="mt-1 text-sm text-white/70">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="mt-16 text-center">
                <h2 className="font-display text-3xl font-bold text-ink">
                    Ready to find your perfect fabric?
                </h2>
                <Link href="/shop" className="btn btn-primary btn-lg mt-6">
                    Browse the collection
                </Link>
            </section>
        </main>
    );
}
