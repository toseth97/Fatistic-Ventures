import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTracker from "@/components/PageTracker";
import Providers from "@/components/Providers";

export const metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: {
        default: "Fatistic Ventures — Premium Nigerian Fabrics & Aso-Oke",
        template: "%s | Fatistic Ventures",
    },
    description:
        "Shop premium Nigerian fabrics — Aso-Oke, Gele, Ankara, Lace, Damask and more. Luxury fabrics delivered nationwide and worldwide.",
    applicationName: "Fatistic Ventures",
    category: "shopping",
    keywords: [
        "Nigerian fabrics",
        "Aso-Oke",
        "Gele",
        "Ankara",
        "Lace",
        "Damask",
        "Fatistic Ventures",
        "Lagos fabrics",
    ],
    creator: "Fatistic Ventures",
    publisher: "Fatistic Ventures",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_NG",
        siteName: "Fatistic Ventures",
        title: "Fatistic Ventures — Premium Nigerian Fabrics",
        description:
            "Premium Nigerian fabrics — Aso-Oke, Gele, Ankara, Lace and Damask — delivered nationwide and worldwide.",
        images: [{ url: "/images/LOGO.png", width: 500, height: 500, alt: "Fatistic Ventures logo" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Fatistic Ventures — Premium Nigerian Fabrics",
        description:
            "Premium Nigerian fabrics — Aso-Oke, Gele, Ankara, Lace and Damask.",
        images: ["/images/LOGO.png"],
    },
    icons: {
        icon: "/images/LOGO.png",
        apple: "/images/LOGO.png",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#b70b68",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="flex min-h-screen flex-col bg-surface-2 text-ink antialiased">
                <Providers>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <PageTracker />
                </Providers>
            </body>
        </html>
    );
}
