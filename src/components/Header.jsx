"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { IconBag, IconSearch, IconUser, IconMenu, IconClose, IconChevron } from "@/components/Icons";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { count } = useCart();

    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [query, setQuery] = useState("");
    const searchRef = useRef(null);
    const accountRef = useRef(null);

    useEffect(() => setMounted(true), []);

    // Load published categories once for the nav dropdown.
    useEffect(() => {
        let alive = true;
        fetch("/api/categories?limit=12")
            .then((r) => (r.ok ? r.json() : { categories: [] }))
            .then((d) => {
                if (alive) setCategories((d.categories || []).slice(0, 10));
            })
            .catch(() => {});
        return () => {
            alive = false;
        };
    }, []);

    // Close menus on navigation.
    useEffect(() => {
        setMobileOpen(false);
        setSearchOpen(false);
        setAccountOpen(false);
        setCatOpen(false);
    }, [pathname]);

    // Close account dropdown on outside click.
    useEffect(() => {
        function onClick(e) {
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    // Escape closes overlays; lock body scroll for the mobile drawer.
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") {
                setMobileOpen(false);
                setSearchOpen(false);
                setAccountOpen(false);
            }
        }
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    function submitSearch(e) {
        e.preventDefault();
        const q = query.trim().slice(0, 100);
        setSearchOpen(false);
        setMobileOpen(false);
        router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    }

    const user = session?.user;
    const isActive = (href) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <>
        <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
            {/* Announcement bar */}
            <div className="hidden bg-ink text-white sm:block">
                <div className="container-x flex h-9 items-center justify-between text-xs">
                    <p className="tracking-wide">
                        Premium Nigerian fabrics — delivered nationwide &amp; worldwide
                    </p>
                    <a
                        href="https://wa.me/2348062572564"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-gold-300 hover:text-gold-200 transition-colors"
                    >
                        Chat on WhatsApp →
                    </a>
                </div>
            </div>

            <div className="container-x flex h-16 items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-baseline gap-1" aria-label="Fatistic Ventures home">
                    <span className="font-display text-2xl font-bold tracking-tight text-ink">
                        Fatistic<span className="text-brand">.</span>
                    </span>
                    <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-soft-grey md:inline">
                        Ventures
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
                    {NAV_LINKS.slice(0, 2).map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isActive(l.href) ? "text-brand" : "text-ink hover:text-brand"
                            }`}
                        >
                            {l.label}
                        </Link>
                    ))}

                    {/* Categories dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setCatOpen(true)}
                        onMouseLeave={() => setCatOpen(false)}
                    >
                        <button
                            type="button"
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:text-brand"
                            aria-expanded={catOpen}
                            aria-haspopup="true"
                        >
                            Categories <IconChevron className={`h-3.5 w-3.5 transition-transform ${catOpen ? "rotate-90" : ""}`} />
                        </button>
                        {catOpen && (
                            <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2">
                                <div className="card-flat rounded-2xl p-2 shadow-lg">
                                    {categories.length === 0 ? (
                                        <p className="px-3 py-2 text-sm text-soft-grey">Loading categories…</p>
                                    ) : (
                                        categories.map((c) => (
                                            <Link
                                                key={c._id || c.slug}
                                                href={`/shop?category=${encodeURIComponent(c.slug || c.name)}`}
                                                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-2 hover:text-brand"
                                            >
                                                <span>{c.displayName || c.name}</span>
                                                {typeof c.productCount === "number" && (
                                                    <span className="text-xs text-soft-grey">{c.productCount}</span>
                                                )}
                                            </Link>
                                        ))
                                    )}
                                    <Link
                                        href="/shop"
                                        className="mt-1 block rounded-xl border-t border-border px-3 py-2 text-sm font-medium text-brand hover:bg-surface-2"
                                    >
                                        View all fabrics →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {NAV_LINKS.slice(2).map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isActive(l.href) ? "text-brand" : "text-ink hover:text-brand"
                            }`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Search */}
                    <div className="relative hidden md:block" ref={searchRef}>
                        {searchOpen ? (
                            <form onSubmit={submitSearch} className="flex items-center">
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search fabrics…"
                                    maxLength={100}
                                    className="input h-10 w-56 rounded-full py-0"
                                    aria-label="Search fabrics"
                                />
                                <button type="submit" className="btn btn-primary btn-sm ml-2 rounded-full">
                                    Go
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(false)}
                                    className="ml-1 p-2 text-soft-grey hover:text-ink"
                                    aria-label="Close search"
                                >
                                    <IconClose />
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                className="rounded-full p-2.5 text-ink transition-colors hover:bg-surface-2 hover:text-brand"
                                aria-label="Search"
                            >
                                <IconSearch />
                            </button>
                        )}
                    </div>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative rounded-full p-2.5 text-ink transition-colors hover:bg-surface-2 hover:text-brand"
                        aria-label="Shopping cart"
                    >
                        <IconBag />
                        {mounted && count > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                                {count > 99 ? "99+" : count}
                            </span>
                        )}
                    </Link>

                    {/* Account */}
                    <div className="relative" ref={accountRef}>
                        <button
                            type="button"
                            onClick={() => setAccountOpen((v) => !v)}
                            className="flex items-center gap-2 rounded-full p-1.5 pr-2 transition-colors hover:bg-surface-2"
                            aria-label="Account menu"
                            aria-expanded={accountOpen}
                        >
                            {mounted && user?.picture ? (
                                <Image
                                    src={user.picture}
                                    alt=""
                                    width={30}
                                    height={30}
                                    className="h-[30px] w-[30px] rounded-full border border-border object-cover"
                                />
                            ) : (
                                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-2 text-ink">
                                    <IconUser className="h-5 w-5" />
                                </span>
                            )}
                        </button>

                        {accountOpen && (
                            <div className="absolute right-0 top-full z-50 w-64 pt-2">
                                <div className="card-flat rounded-2xl p-2 shadow-lg">
                                    {mounted && user ? (
                                        <>
                                            <div className="flex items-center gap-3 px-3 py-2">
                                                {user.picture && (
                                                    <Image
                                                        src={user.picture}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        className="h-10 w-10 rounded-full border border-border object-cover"
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                                                    <p className="truncate text-xs text-soft-grey">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="my-1 border-t border-border" />
                                            <Link href="/account" className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface-2">
                                                My Account
                                            </Link>
                                            <Link href="/account?tab=orders" className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface-2">
                                                My Orders
                                            </Link>
                                            <Link href="/cart" className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface-2">
                                                My Cart
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
                                            >
                                                Sign out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="px-3 pb-1 pt-2 text-sm font-semibold text-ink">Welcome</p>
                                            <p className="px-3 pb-2 text-xs text-soft-grey">
                                                Sign in to shop, track orders and check out faster.
                                            </p>
                                            <Link href="/signin" className="btn btn-primary btn-block btn-sm my-1">
                                                Sign in with Google
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="rounded-full p-2.5 text-ink transition-colors hover:bg-surface-2 lg:hidden"
                        aria-label="Open menu"
                    >
                        <IconMenu />
                    </button>
                </div>
            </div>

            {/* Mobile drawer — portalled to <body> so it escapes the sticky
                header + backdrop-blur stacking context, which otherwise traps
                `fixed` descendants and clips the drawer to header height. */}
            {mounted &&
                mobileOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
                    <div
                        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-2xl">
                        <div className="flex h-16 items-center justify-between border-b border-border px-5">
                            <span className="font-display text-xl font-bold text-ink">
                                Fatistic<span className="text-brand">.</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-full p-2 text-ink hover:bg-surface-2"
                                aria-label="Close menu"
                            >
                                <IconClose />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            <form onSubmit={submitSearch} className="mb-5">
                                <div className="flex gap-2">
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search fabrics…"
                                        maxLength={100}
                                        className="input"
                                        aria-label="Search fabrics"
                                    />
                                    <button type="submit" className="btn btn-primary btn-sm shrink-0" aria-label="Search">
                                        <IconSearch className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>

                            <nav className="space-y-1" aria-label="Mobile navigation">
                                {NAV_LINKS.map((l) => (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        className={`block rounded-xl px-4 py-3 text-base font-medium ${
                                            isActive(l.href) ? "bg-brand/5 text-brand" : "text-ink hover:bg-surface-2"
                                        }`}
                                    >
                                        {l.label}
                                    </Link>
                                ))}
                            </nav>

                            <p className="mt-6 mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-soft-grey">
                                Fabric categories
                            </p>
                            <div className="space-y-1">
                                {categories.map((c) => (
                                    <Link
                                        key={c._id || c.slug}
                                        href={`/shop?category=${encodeURIComponent(c.slug || c.name)}`}
                                        className="block rounded-xl px-4 py-2.5 text-sm text-ink hover:bg-surface-2"
                                    >
                                        {c.displayName || c.name}
                                    </Link>
                                ))}
                                <Link href="/shop" className="block rounded-xl px-4 py-2.5 text-sm font-medium text-brand">
                                    View all fabrics →
                                </Link>
                            </div>
                        </div>

                        <div className="border-t border-border p-5">
                            {mounted && user ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        {user.picture && (
                                            <Image src={user.picture} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                                            <p className="truncate text-xs text-soft-grey">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link href="/account" className="btn btn-outline btn-block btn-sm">
                                        My Account
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="btn btn-danger btn-block btn-sm"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <Link href="/signin" className="btn btn-primary btn-block btn-sm">
                                    Sign in with Google
                                </Link>
                            )}
                        </div>
                    </div>
                    </div>,
                    document.body,
                )}
        </header>
        </>
    );
}



