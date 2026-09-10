import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { connectDB } from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";

// Site-wide defaults; admin-managed values (SiteSetting "site") override these.
const DEFAULTS = {
    phone: "+234 806 257 2564",
    email: "hello@fatisticventures.com",
    address: "Lagos, Nigeria",
    whatsapp: "2348062572564",
    instagram: "https://instagram.com/fatisticventures",
    facebook: "https://facebook.com/fatisticventures",
    twitter: "",
    tiktok: "",
};

async function getSiteInfo() {
    try {
        await connectDB();
        const doc = await SiteSetting.findOne({ key: "site" }).lean();
        return { ...DEFAULTS, ...(doc?.value || {}) };
    } catch {
        return DEFAULTS;
    }
}

export default async function Footer() {
    const site = await getSiteInfo();
    const year = new Date().getFullYear();

    const socials = [
        ["Instagram", site.instagram],
        ["Facebook", site.facebook],
        ["Twitter", site.twitter],
        ["TikTok", site.tiktok],
    ].filter(([, url]) => !!url);

    return (
        <footer className="mt-auto border-t border-border bg-white">
            {/* Trust strip */}
            <div className="border-b border-border bg-surface-2">
                <div className="container-x grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
                    {[
                        ["🚚", "Fast Delivery", "Nationwide & worldwide shipping"],
                        ["🧵", "Premium Quality", "Hand-picked luxury fabrics"],
                        ["🔒", "Secure Checkout", "Pay securely via Paystack"],
                    ].map(([icon, title, text]) => (
                        <div key={title} className="flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">{icon}</span>
                            <div>
                                <p className="text-sm font-semibold text-ink">{title}</p>
                                <p className="text-xs text-soft-grey">{text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container-x grid grid-cols-2 gap-10 py-12 md:grid-cols-5">
                {/* Brand */}
                <div className="col-span-2">
                    <BrandLogo variant="footer" />
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-soft-grey">
                        Premium Nigerian fabrics — Aso-Oke, Gele, Ankara, Lace,
                        Damask and more — delivered nationwide and worldwide
                        with love from Lagos.
                    </p>
                    <div className="mt-5 flex gap-3">
                        {socials.map(([name, url]) => (
                            <a
                                key={name}
                                href={url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand"
                            >
                                {name}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Shop */}
                <div>
                    <p className="text-sm font-semibold text-ink">Shop</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-soft-grey">
                        <li><Link href="/shop" className="hover:text-brand">All Fabrics</Link></li>
                        <li><Link href="/shop?sort=newest" className="hover:text-brand">New Arrivals</Link></li>
                        <li><Link href="/shop?featured=true" className="hover:text-brand">Featured</Link></li>
                        <li><Link href="/shop?availability=in_stock" className="hover:text-brand">In Stock</Link></li>
                        <li><Link href="/cart" className="hover:text-brand">My Cart</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <p className="text-sm font-semibold text-ink">Company</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-soft-grey">
                        <li><Link href="/about" className="hover:text-brand">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
                        <li><Link href="/account" className="hover:text-brand">My Account</Link></li>
                        <li><Link href="/account?tab=orders" className="hover:text-brand">Order History</Link></li>
                    </ul>
                </div>

                {/* Contact + policies */}
                <div>
                    <p className="text-sm font-semibold text-ink">Get in touch</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-soft-grey">
                        <li>
                            <a href={`tel:${String(site.phone).replace(/[^+\d]/g, "")}`} className="hover:text-brand">
                                {site.phone}
                            </a>
                        </li>
                        <li>
                            <a href={`mailto:${site.email}`} className="hover:text-brand">{site.email}</a>
                        </li>
                        <li>{site.address}</li>
                    </ul>
                    <ul className="mt-5 space-y-2.5 text-sm text-soft-grey">
                        <li><Link href="/terms" className="hover:text-brand">Terms &amp; Conditions</Link></li>
                        <li><Link href="/privacy" className="hover:text-brand">Privacy Policy</Link></li>
                        <li><Link href="/returns" className="hover:text-brand">Returns &amp; Refunds</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-soft-grey sm:flex-row">
                    <p>© {year} Fatistic Ventures. All rights reserved.</p>
                    <p>
                        Secured payments by{" "}
                        <span className="font-semibold text-ink">Paystack</span> ·
                        Built with care in Lagos 🇳🇬
                    </p>
                </div>
            </div>
        </footer>
    );
}

