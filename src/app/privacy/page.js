import PolicyPage from "@/components/PolicyPage";

export const metadata = {
    title: "Privacy Policy",
    description: "How Fatistic Ventures collects, uses and protects your personal data.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
    return (
        <PolicyPage
            title="Privacy Policy"
            updated="January 2026"
            intro="Your privacy matters. This policy explains what personal data we collect, why we collect it, and how we keep it safe."
            sections={[
                {
                    title: "1. What we collect",
                    body: [
                        "Account data: your name, email address and profile photo from Google when you sign in with Google. We never receive or store your Google password.",
                        "Order data: delivery details (name, phone, address, city, state, country), order notes, and the products you purchase.",
                        "Technical data: basic, non-identifying analytics such as page views and device type, used to improve the store.",
                    ],
                },
                {
                    title: "2. What we never collect",
                    body: "We never collect or store card numbers, CVV codes, PINs, or other full payment credentials. All card payments are handled entirely by Paystack on their secure infrastructure.",
                },
                {
                    title: "3. How we use your data",
                    body: [
                        "To fulfil your orders and arrange delivery.",
                        "To provide your account features (order history, saved details).",
                        "To contact you about your order via email, phone or WhatsApp.",
                        "To keep the store secure and prevent fraud.",
                    ],
                },
                {
                    title: "4. Who we share it with",
                    body: [
                        "Payment provider: Paystack receives your email and payment amount to process transactions.",
                        "Delivery partners: we share the minimum delivery details needed to get your order to you.",
                        "We do not sell your personal data to anyone.",
                    ],
                },
                {
                    title: "5. Security",
                    body: "We protect your data with encrypted connections (HTTPS), strict access controls, secure session handling, and server-side authorisation. Access to admin systems is limited and logged.",
                },
                {
                    title: "6. Cookies",
                    body: "We use a small number of essential cookies to keep you signed in and maintain your shopping session, plus optional analytics. You can control cookies in your browser settings.",
                },
                {
                    title: "7. Your rights",
                    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. Deleting your account also removes associated personal data, except records we must keep for legal or accounting purposes.",
                },
                {
                    title: "8. Contact",
                    body: "For privacy questions or requests, email hello@fatisticventures.com.",
                },
            ]}
        />
    );
}
