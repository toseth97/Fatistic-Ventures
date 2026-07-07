"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "../../publicimages/LOGO.png";

export default function Footer() {
    return (
        <footer className="relative mt-auto overflow-hidden bg-accent text-white">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent to-[#7A0E52]" />
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="animate-slide-up">
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/10 p-1 backdrop-blur-sm">
                                <div className="w-full h-full rounded-[20px] bg-white flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={Logo}
                                        alt="Fatistic Ventures"
                                        width={96}
                                        height={96}
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                            <div>
                                <span className="font-display text-2xl font-bold text-white">
                                    Fatistic Ventures
                                </span>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-white/85 leading-relaxed">
                            Aso-Oke Guru — Luxury | Quality | Elegance. Premium
                            Nigerian fabrics delivered nationwide and worldwide.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <a
                                href="https://wa.me/2348062572564"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </a>
                            <a
                                href="tel:08062572564"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div
                        className="animate-slide-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Shop
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {["Aso-Oke", "Gele", "Damask"].map((cat) => (
                                <li key={cat}>
                                    <Link
                                        href={`/shop?category=${encodeURIComponent(cat)}`}
                                        className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/shop"
                                    className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                                >
                                    All Fabrics →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div
                        className="animate-slide-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Company
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {[
                                { href: "/about", label: "About Us" },
                                { href: "/contact", label: "Contact" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div
                        className="animate-slide-up"
                        style={{ animationDelay: "0.3s" }}
                    >
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Contact
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-white/80">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5">📍</span>
                                <span>
                                    1B, Araromi Street, Beside Kairo Market,
                                    Oshodi, Lagos
                                </span>
                            </li>
                            <li>
                                <a
                                    href="tel:08062572564"
                                    className="hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <span>📞</span> 0806 257 2564
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:08028331967"
                                    className="hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <span>📞</span> 0802 833 1967
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://wa.me/2348062572564"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:shadow-lg hover:shadow-accent/30 transition-all duration-300"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Chat on WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/50">
                        &copy; {new Date().getFullYear()} Fatistic Ventures. All
                        rights reserved.
                    </p>
                    <p className="text-xs text-white/50 flex items-center gap-1">
                        <span>🚚</span> Delivering nationwide & worldwide
                    </p>
                </div>
            </div>
        </footer>
    );
}
