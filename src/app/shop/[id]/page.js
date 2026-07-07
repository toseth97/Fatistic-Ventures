import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import { getWhatsAppLink } from "@/lib/whatsapp";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export default async function ProductPage({ params }) {
    const productRes = await fetch(
        (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
            "/api/products/" +
            params.id,
        { cache: "no-store" },
    );

    const data = await productRes.json().catch(() => null);
    const product = data?.product;

    if (!product) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-10">
                <div className="glass-card p-8 text-center">
                    <div className="text-4xl mb-3">🧵</div>
                    <div className="text-charcoal font-semibold text-lg">
                        Product not found
                    </div>
                    <Link
                        href="/shop"
                        className="text-gold-600 mt-4 inline-block hover:text-gold-700"
                    >
                        ← Back to shop
                    </Link>
                </div>
            </main>
        );
    }

    const price =
        typeof product.price === "number"
            ? product.price
            : Number(product.price || 0);
    const images = product.images || [];
    const heroImg = images?.[0]?.url;

    const baseWhatsApp = process.env.WHATSAPP_BASE_NUMBER || "08062572564";
    const waHref = getWhatsAppLink({
        baseNumber: baseWhatsApp,
        productName: product.name,
        priceNaira: price,
    });

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "/" },
                    { name: "Shop", url: "/shop" },
                    {
                        name: product.category,
                        url: `/shop?category=${encodeURIComponent(product.category)}`,
                    },
                    { name: product.name, url: `/shop/${params.id}` },
                ]}
            />

            <nav className="text-sm text-soft-grey mb-6">
                <Link
                    href="/"
                    className="hover:text-charcoal transition-colors"
                >
                    Home
                </Link>
                <span className="mx-2">/</span>
                <Link
                    href="/shop"
                    className="hover:text-charcoal transition-colors"
                >
                    Shop
                </Link>
                <span className="mx-2">/</span>
                <Link
                    href={`/shop?category=${encodeURIComponent(product.category)}`}
                    className="hover:text-charcoal transition-colors"
                >
                    {product.category}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-charcoal">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-0 overflow-hidden">
                    {heroImg ? (
                        <img
                            src={heroImg}
                            alt={product.name}
                            className="w-full h-[440px] object-cover"
                        />
                    ) : (
                        <div className="w-full h-[440px] bg-gray-100 flex items-center justify-center text-soft-grey">
                            No image available
                        </div>
                    )}
                    {images.length > 1 ? (
                        <div className="p-4 flex gap-3 overflow-x-auto border-t border-gray-200/50">
                            {images.slice(0, 6).map((img) => (
                                <img
                                    key={img.publicId}
                                    src={img.url}
                                    alt={product.name}
                                    className="w-20 h-20 object-cover rounded-glass-sm border border-gray-200/50 flex-shrink-0"
                                />
                            ))}
                        </div>
                    ) : null}
                </GlassCard>

                <div>
                    <div className="glass-card p-6">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold-50 text-gold-700 font-medium">
                            {product.category}
                        </span>

                        <h1 className="font-display text-3xl font-semibold text-charcoal mt-3">
                            {product.name}
                        </h1>

                        <p className="text-gold-600 font-semibold mt-3 text-2xl">
                            ₦{price.toLocaleString()}
                        </p>

                        <p className="mt-4 text-soft-grey leading-relaxed">
                            {product.description || ""}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <span
                                className={`w-2 h-2 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-400"}`}
                            />
                            <span className="text-soft-grey">
                                {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <a
                                href={waHref}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1"
                                onClick={async () => {
                                    try {
                                        await fetch("/api/analytics/track", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                type: "whatsapp_click",
                                                productId: product._id,
                                                meta: {},
                                            }),
                                        });
                                    } catch (_) {}
                                }}
                            >
                                <GlassButton
                                    className="w-full hover:shadow-glow"
                                    variant="gold"
                                >
                                    Order via WhatsApp
                                </GlassButton>
                            </a>

                            <Link href="/shop" className="flex-1">
                                <GlassButton
                                    className="w-full"
                                    variant="emerald"
                                >
                                    Keep Browsing
                                </GlassButton>
                            </Link>
                        </div>

                        <p className="mt-4 text-xs text-soft-grey text-center">
                            Delivery nationwide and worldwide
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
