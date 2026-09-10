import PolicyPage from "@/components/PolicyPage";

export const metadata = {
    title: "Terms & Conditions",
    description: "Terms and conditions for shopping with Fatistic Ventures.",
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return (
        <PolicyPage
            title="Terms & Conditions"
            updated="January 2026"
            intro="Welcome to Fatistic Ventures. By using our website or placing an order, you agree to these terms. Please read them carefully."
            sections={[
                {
                    title: "1. About us",
                    body: "Fatistic Ventures is a Nigerian fabric retailer offering premium Aso-Oke, Gele, Ankara, Lace, Damask and related fabrics, delivered nationwide and worldwide.",
                },
                {
                    title: "2. Orders and acceptance",
                    body: [
                        "Placing an order on this website constitutes an offer to purchase. An order is accepted when we confirm it by email, WhatsApp or phone.",
                        "We reserve the right to decline or cancel any order (in whole or in part) if a product is unavailable, mispriced, or if the order appears fraudulent. If we cancel a paid order, you will receive a full refund.",
                    ],
                },
                {
                    title: "3. Pricing and payment",
                    body: [
                        "All prices are displayed in Nigerian Naira (₦) and include applicable taxes unless stated otherwise.",
                        "We accept payment via Paystack (card, bank transfer, USSD), direct bank transfer, pay on delivery (where available) or payment arranged through WhatsApp.",
                        "Order totals are calculated on our servers from live product prices. If a price changes between adding to cart and checkout, we will always use the price confirmed at checkout.",
                    ],
                },
                {
                    title: "4. Delivery",
                    body: [
                        "Delivery timelines vary by location. Lagos deliveries typically arrive within 1–3 business days; national and international deliveries may take longer.",
                        "Risk of loss passes to you upon delivery to the address you provided. Please ensure your delivery details are accurate; we are not responsible for orders lost due to incorrect addresses.",
                    ],
                },
                {
                    title: "5. Product descriptions and colours",
                    body: "We work hard to display fabrics accurately. However, colours may vary slightly depending on your screen settings and dye lots. Measurements may have a small variance typical of hand-woven fabrics.",
                },
                {
                    title: "6. Acceptable use",
                    body: "You agree not to misuse this website, including attempting unauthorised access, scraping at disruptive volumes, interfering with the site's operation, or using it for any unlawful purpose.",
                },
                {
                    title: "7. Limitation of liability",
                    body: "To the maximum extent permitted by law, Fatistic Ventures is not liable for indirect or consequential losses arising from your use of the website. Our total liability for any order is limited to the amount you paid for that order.",
                },
                {
                    title: "8. Changes to these terms",
                    body: "We may update these terms from time to time. Continued use of the website after changes are posted constitutes acceptance of the updated terms.",
                },
                {
                    title: "9. Contact",
                    body: "For any questions about these terms, contact us at hello@fatisticventures.com or on WhatsApp.",
                },
            ]}
        />
    );
}
