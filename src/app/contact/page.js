import GlassCard from "@/components/ui/GlassCard";
import HeroTextAnimator from "@/components/HeroTextAnimator";

export default function ContactPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="max-w-4xl mx-auto">
                <section className="relative rounded-glass-lg overflow-hidden border border-gray-200/50 bg-white/80 backdrop-blur-md shadow-glass-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-cream to-accent/10" />
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 20%, #B70B68 0%, transparent 55%), radial-gradient(circle at 80% 0%, #E6B800 0%, transparent 50%)",
                        }}
                    />
                    <div className="relative p-8 md:p-10">
                        <HeroTextAnimator
                            title="Contact Us "
                            subtitle="Orders, inquiries, and availability checks"
                            titleClassName="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-charcoal leading-tight"
                            subtitleClassName="mt-3 text-accent font-semibold text-lg tracking-tight"
                        />

                        <p className="text-soft-grey mt-6 leading-relaxed text-lg">
                            For orders, inquiries, and availability checks,
                            reach us via WhatsApp or phone.
                        </p>
                    </div>
                </section>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard className="p-8">
                        <h2 className="font-display text-2xl font-semibold text-charcoal">
                            Get in Touch
                        </h2>

                        <div className="mt-6 space-y-6">
                            <div>
                                <p className="text-xs text-soft-grey uppercase tracking-wider font-medium">
                                    Location
                                </p>
                                <p className="text-charcoal font-medium mt-1">
                                    1B, Araromi Street, Beside Kairo Market,
                                    Oshodi, Lagos, Nigeria
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-soft-grey uppercase tracking-wider font-medium">
                                    Phone / WhatsApp
                                </p>
                                <a
                                    href="tel:08062572564"
                                    className="block text-charcoal font-medium mt-1 hover:text-accent transition-colors"
                                >
                                    0806 257 2564
                                </a>
                                <a
                                    href="tel:08028331967"
                                    className="block text-charcoal font-medium mt-1 hover:text-accent transition-colors"
                                >
                                    0802 833 1967
                                </a>
                            </div>

                            <div>
                                <p className="text-xs text-soft-grey uppercase tracking-wider font-medium">
                                    WhatsApp
                                </p>
                                <a
                                    href="https://wa.me/2348062572564"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="glass-button-gold mt-2 inline-flex text-sm"
                                >
                                    Chat on WhatsApp
                                </a>
                            </div>

                            <div>
                                <p className="text-xs text-soft-grey uppercase tracking-wider font-medium">
                                    Delivery
                                </p>
                                <p className="text-charcoal font-medium mt-1">
                                    Nationwide & Worldwide
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                        <h2 className="font-display text-2xl font-semibold text-charcoal">
                            Visit Our Location
                        </h2>
                        <p className="text-soft-grey text-sm mt-2">
                            Oshodi, Lagos, Nigeria
                        </p>

                        <div className="mt-4 rounded-glass-sm overflow-hidden border border-gray-200/50">
                            <div className="w-full aspect-[4/3] bg-gradient-to-br from-accent/10 to-white flex items-center justify-center text-soft-grey text-sm relative">
                                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-accent/15 blur-xl" />
                                <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-accent/20 blur-xl" />
                                <div className="text-center p-4 relative">
                                    <div className="text-4xl mb-2">📍</div>
                                    <p className="font-medium text-charcoal">
                                        1B, Araromi Street, Beside Kairo Market
                                    </p>
                                    <p className="mt-1">Oshodi, Lagos</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </main>
    );
}
