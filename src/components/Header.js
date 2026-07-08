"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Logo from "../../publicimages/LOGO.png";

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path) => pathname === path;

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/shop", label: "Shop" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "backdrop-blur-xl bg-white/85 shadow-lg shadow-black/5 border-b border-accent/20"
                    : "backdrop-blur-sm bg-white/60"
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-14 h-14 md:w-16 md:h-16 overflow-hidden rounded-2xl bg-accent p-0.5 shadow-lg shadow-accent/25 transition-all duration-300">
                            <div className="w-full h-full rounded-[16px] bg-white flex items-center justify-center overflow-hidden">
                                <Image
                                    src={Logo}
                                    alt="Fatistic Ventures"
                                    width={96}
                                    height={96}
                                    className="object-contain w-full h-full"
                                    priority
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                    isActive(link.href)
                                        ? "text-white bg-accent shadow-sm shadow-accent/20"
                                        : "text-accent/90 hover:text-accent hover:bg-accent/10"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://wa.me/2348062572564"
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 transition-all duration-300"
                        >
                            <span className="flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </span>
                        </a>

                        {/* Google Auth */}
                        {status === "authenticated" && session?.user ? (
                            <div className="relative group ml-2">
                                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-gray-200/50 hover:bg-white hover:shadow-sm transition-all">
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            className="w-7 h-7 rounded-full object-cover border-2 border-accent/20"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-burgundy-600 flex items-center justify-center text-white text-xs font-bold">
                                            {session.user.name?.[0] || "U"}
                                        </div>
                                    )}
                                    <span className="text-xs text-charcoal font-medium max-w-[80px] truncate">
                                        {session.user.name || "User"}
                                    </span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white rounded-xl shadow-xl border border-gray-200/60 p-2">
                                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                                            <p className="text-xs font-medium text-charcoal truncate">
                                                {session.user.name}
                                            </p>
                                            <p className="text-[10px] text-soft-grey truncate">
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() =>
                                    signIn("google", {
                                        callbackUrl: window.location.href,
                                    })
                                }
                                className="ml-2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200/60 text-sm font-medium text-charcoal hover:bg-gray-50 hover:shadow-sm transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in
                            </button>
                        )}
                    </nav>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2.5 rounded-xl bg-accent/10 hover:bg-accent/15 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-5 h-5 text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {mobileOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile nav */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-accent/20 pt-3 animate-fade-in">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                                    isActive(link.href)
                                        ? "bg-accent/10 text-accent"
                                        : "text-accent/80 hover:text-accent hover:bg-accent/10"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://wa.me/2348062572564"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl bg-accent text-white text-sm font-medium shadow-lg shadow-accent/25 transition-all duration-300"
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
                    </div>
                )}
            </div>
        </header>
    );
}
