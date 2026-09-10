import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductDetail from "./ProductDetail";
import ProductCard from "@/components/ProductCard";
import { getWhatsAppLink } from "@/lib/whatsapp";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const BASE_WHATSAPP = process.env.WHATSAPP_BASE_NUMBER || "08062572564";

function isMongoId(id) {
    return /^[a-f\d]{24}$/i.test(String(id || ""));
}

async function getProduct(idOrSlug) {
    try {
        await connectDB();
        const query = isMongoId(idOrSlug)
            ? { _id: idOrSlug }
            : { slug: String(idOrSlug || "").toLowerCase() };
        return await Product.findOne({ ...query, published: true }).lean();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = (await params) || {};
    const product = await getProduct(id);
    if (!product) {
        return { title: "Product not found" };
    }
    const description =
        (product.description || "").slice(0, 155) ||
        `Shop ${product.name} — premium Nigerian fabric from Fatistic Ventures.`;
    const image = product.images?.[0]?.url;
    return {
        title: product.name,
        description,
        alternates: { canonical: `/shop/${product.slug || product._id}` },
        openGraph: {
            type: "website",
            title: `${product.name} | Fatistic Ventures`,
            description,
            ...(image ? { images: [{ url: image }] } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description,
            ...(image ? { images: [image] } : {}),
        },
    };
}

export default async function ProductPage({ params }) {
    const { id } = (await params) || {};
    const product = await getProduct(id);
    if (!product) notFound();

    const category = await (async () => {
        try {
            if (!product.categoryId) return null;
            await connectDB();
            return await Category.findById(product.categoryId).lean();
        } catch {
            return null;
        }
    })();
    const categoryName = category?.displayName || category?.name || product.category || "";

    // Related products: same category, published, not this product.
    let related = [];
    try {
        const relatedFilter = {
            published: true,
            _id: { $ne: product._id },
            $or: [
                ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
                { category: product.category },
            ],
        };
        related = await Product.find(relatedFilter).sort({ featured: -1, createdAt: -1 }).limit(4).lean();
    } catch {
        related = [];
    }

    const price = Number(product.price) || 0;
    const productUrl = `${SITE_URL}/shop/${product.slug || product._id}`;
    const waHref = getWhatsAppLink({
        baseNumber: BASE_WHATSAPP,
        productName: product.name,
        priceNaira: price,
    });

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: (product.description || "").slice(0, 500),
        category: categoryName || undefined,
        url: productUrl,
        ...(product.images?.[0]?.url ? { image: product.images.map((i) => i.url).slice(0, 5) } : {}),
        offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "NGN",
            price: price,
            availability:
                product.inStock === false || Number(product.quantity) <= 0
                    ? "https://schema.org/OutOfStock"
                    : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
        },
    };

    return (
        <main className="shell py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-soft-grey">
                <ol className="flex flex-wrap items-center gap-1.5">
                    <li><Link href="/" className="hover:text-brand">Home</Link></li>
                    <li aria-hidden="true">/</li>
                    <li><Link href="/shop" className="hover:text-brand">Shop</Link></li>
                    {categoryName && (
                        <>
                            <li aria-hidden="true">/</li>
                            <li>
                                <Link
                                    href={`/shop?category=${encodeURIComponent(category?.slug || product.category || "")}`}
                                    className="hover:text-brand"
                                >
                                    {categoryName}
                                </Link>
                            </li>
                        </>
                    )}
                    <li aria-hidden="true">/</li>
                    <li className="max-w-[16rem] truncate font-medium text-ink" aria-current="page">
                        {product.name}
                    </li>
                </ol>
            </nav>

            <ProductDetail
                product={JSON.parse(JSON.stringify(product))}
                categoryName={categoryName}
                whatsappHref={waHref}
            />

            {related.length > 0 && (
                <section className="mt-16" aria-label="Related products">
                    <div className="section-head">
                        <div>
                            <p className="eyebrow">You may also like</p>
                            <h2 className="section-title mt-1 text-2xl sm:text-3xl">Related Fabrics</h2>
                        </div>
                        <Link href="/shop" className="hidden text-sm font-medium text-brand hover:underline sm:block">
                            View all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                        {related.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}

