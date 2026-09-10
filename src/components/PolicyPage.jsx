import Link from "next/link";

// Shared layout for legal/policy pages.
export default function PolicyPage({ title, updated, intro, sections }) {
    return (
        <main className="shell py-12">
            <div className="mx-auto max-w-3xl">
                <p className="eyebrow">Legal</p>
                <h1 className="section-title mt-2">{title}</h1>
                {updated && <p className="mt-2 text-sm text-soft-grey">Last updated: {updated}</p>}

                {intro && (
                    <p className="prose-safe mt-6 text-base leading-relaxed text-soft-grey">{intro}</p>
                )}

                <div className="mt-8 space-y-8">
                    {sections.map((s, i) => (
                        <section key={i} className="card rounded-2xl p-6 sm:p-8">
                            <h2 className="font-display text-xl font-bold text-ink">{s.title}</h2>
                            {Array.isArray(s.body) ? (
                                <div className="prose-safe mt-3 space-y-3 text-sm leading-relaxed text-soft-grey">
                                    {s.body.map((p, j) => (
                                        <p key={j}>{p}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="prose-safe mt-3 text-sm leading-relaxed text-soft-grey">{s.body}</p>
                            )}
                        </section>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link href="/contact" className="btn btn-outline btn-md">
                        Questions? Contact us
                    </Link>
                </div>
            </div>
        </main>
    );
}
