import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTracker from "@/components/PageTracker";

export const metadata = {
    title: "Fatistic Ventures — Aso-Oke Guru",
    description:
        "Aso-Oke Guru — Luxury | Quality | Elegance. Premium Nigerian fabrics delivered nationwide and worldwide.",
    openGraph: {
        title: "Fatistic Ventures — Aso-Oke Guru",
        description:
            "Premium Nigerian fabrics — Aso-Oke, Gele, and Damask — delivered nationwide and worldwide.",
        type: "website",
        locale: "en_NG",
        siteName: "Fatistic Ventures",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
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
            <body className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 text-charcoal antialiased font-sans overflow-x-hidden">
                <Header />
                <main className="min-h-screen pt-20 md:pt-24">{children}</main>
                <Footer />
                <PageTracker />
            </body>
        </html>
    );
}
