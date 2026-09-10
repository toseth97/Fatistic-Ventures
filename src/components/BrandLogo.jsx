import Image from "next/image";
import Link from "next/link";

// Reusable business logo lockup — image mark + wordmark.
// `variant`: "header" | "footer" | "compact" | "admin"
export default function BrandLogo({ variant = "header", href = "/" }) {
    const sizes = {
        header: { img: 40, text: "text-xl", sub: true },
        footer: { img: 44, text: "text-2xl", sub: false },
        compact: { img: 36, text: "text-lg", sub: false },
        admin: { img: 36, text: "text-lg", sub: true },
    };
    const s = sizes[variant] || sizes.header;

    const lockup = (
        <>
            <Image
                src="/images/LOGO.png"
                alt="Fatistic Ventures logo"
                width={s.img}
                height={s.img}
                priority={variant === "header"}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                style={{ width: s.img, height: s.img }}
            />
            <span className="flex min-w-0 flex-col leading-none">
                <span className={`font-display font-bold text-ink ${s.text}`}>
                    Fatistic<span className="text-brand">.</span>
                </span>
                {s.sub && (
                    <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-soft-grey sm:block">
                        Ventures
                    </span>
                )}
            </span>
        </>
    );

    if (!href) {
        return (
            <span className="flex items-center gap-2.5" aria-label="Fatistic Ventures">
                {lockup}
            </span>
        );
    }
    return (
        <Link href={href} className="flex items-center gap-2.5" aria-label="Fatistic Ventures home">
            {lockup}
        </Link>
    );
}
