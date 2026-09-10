import Link from "next/link";
import { IconWhatsApp } from "@/components/Icons";

export const metadata = {
    title: "Contact Us",
    description:
        "Reach Fatistic Ventures on WhatsApp, phone or email — we're happy to help with fabrics, orders and deliveries.",
    alternates: { canonical: "/contact" },
};

const WHATSAPP = "https://wa.me/2348062572564";

export default function ContactPage() {
    return (
        <main className="shell py-12">
            <div className="mx-auto max-w-3xl text-center">
                <p className="eyebrow">We&apos;d love to hear from you</p>
                <h1 className="section-title mt-2">Contact Fatistic Ventures</h1>
                <p className="mx-auto mt-4 max-w-xl text-base text-soft-grey">
                  Questions about a fabric, your order or a bulk purchase?
                  The fastest way to reach us is WhatsApp — but we&apos;re on
                  phone and email too.
                </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* WhatsApp */}
                <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className="card group rounded-3xl p-7 text-center transition-shadow hover:shadow-lg"
                >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                        <IconWhatsApp className="h-7 w-7" />
                    </span>
                    <h2 className="mt-4 font-semibold text-ink">WhatsApp</h2>
                    <p className="mt-1 text-sm text-soft-grey">Fastest response — usually within minutes</p>
                    <p className="mt-3 text-sm font-medium text-brand group-hover:underline">Chat now →</p>
                </a>

                {/* Phone */}
                <a
                    href="tel:+2348062572564"
                    className="card group rounded-3xl p-7 text-center transition-shadow hover:shadow-lg"
                >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand text-2xl" aria-hidden="true">
                        📞
                    </span>
                    <h2 className="mt-4 font-semibold text-ink">Phone</h2>
                    <p className="mt-1 text-sm text-soft-grey">Mon–Sat, 9am–6pm (WAT)</p>
                    <p className="mt-3 text-sm font-medium text-brand group-hover:underline">+234 806 257 2564</p>
                </a>

                {/* Email */}
                <a
                    href="mailto:hello@fatisticventures.com"
                    className="card group rounded-3xl p-7 text-center transition-shadow hover:shadow-lg"
                >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-2xl" aria-hidden="true">
                        ✉️
                    </span>
                    <h2 className="mt-4 font-semibold text-ink">Email</h2>
                    <p className="mt-1 text-sm text-soft-grey">For orders, returns &amp; partnerships</p>
                    <p className="mt-3 break-all text-sm font-medium text-brand group-hover:underline">
                        hello@fatisticventures.com
                    </p>
                </a>
            </div>

            {/* Location card */}
            <div className="card mx-auto mt-8 max-w-4xl rounded-3xl p-8 text-center">
                <h2 className="font-display text-xl font-bold text-ink">Where we are</h2>
                <p className="mt-2 text-sm text-soft-grey">
                    Lagos, Nigeria — delivering nationwide and worldwide. Studio
                    visits by appointment.
                </p>
                <Link href="/shop" className="btn btn-primary btn-md mt-6">
                    Browse fabrics while you&apos;re here
                </Link>
            </div>
        </main>
    );
}
