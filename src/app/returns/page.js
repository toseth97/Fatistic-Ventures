import PolicyPage from "@/components/PolicyPage";

export const metadata = {
    title: "Returns & Refunds",
    description: "Return, exchange and refund policy for Fatistic Ventures.",
    alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
    return (
        <PolicyPage
            title="Returns & Refunds"
            updated="January 2026"
            intro="We want you to love your fabric. If something isn't right, here's how we make it right."
            sections={[
                {
                    title: "1. Eligibility",
                    body: [
                        "You may request a return or exchange within 3 days of delivery if the fabric is defective, damaged, or materially different from what you ordered.",
                        "Fabrics must be unwashed, uncut, and in their original condition with tags/packaging intact.",
                        "For hygiene and quality reasons, custom-cut lengths sold as final sale are only returnable if defective.",
                    ],
                },
                {
                    title: "2. How to start a return",
                    body: [
                        "Contact us within 3 days of delivery via WhatsApp or email with your order number and photos of the issue.",
                        "We will review your request within 24 hours and arrange the next steps, including return shipping where applicable.",
                    ],
                },
                {
                    title: "3. Refunds",
                    body: [
                        "Approved refunds are issued to your original payment method (via Paystack) or as bank transfer for other payment methods.",
                        "Refunds are typically processed within 3–5 business days of us receiving and inspecting the returned item.",
                        "Delivery fees are refundable only when the return is due to our error (wrong or defective item).",
                    ],
                },
                {
                    title: "4. Exchanges",
                    body: "Subject to stock availability, you may exchange an eligible item for another fabric of equal value. Any price difference is settled before dispatch.",
                },
                {
                    title: "5. Damaged or lost parcels",
                    body: "If your parcel arrives damaged or is lost in transit, contact us immediately with your order number. We will work with the courier to resolve it and replace or refund eligible orders.",
                },
                {
                    title: "6. Cancellations",
                    body: "Orders can be cancelled before they are dispatched — contact us as soon as possible. Once an order is shipped, the returns process above applies instead.",
                },
                {
                    title: "7. Contact",
                    body: "Returns, exchanges and refund questions: hello@fatisticventures.com or WhatsApp.",
                },
            ]}
        />
    );
}
