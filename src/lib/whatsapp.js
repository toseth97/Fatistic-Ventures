export function getWhatsAppLink({ baseNumber, productName, priceNaira }) {
    const clean = (v) => String(v || "").trim();

    // baseNumber expected like: "08062572564" (no +)
    const number = clean(baseNumber).replace(/[^0-9]/g, "");

    const message = `Hi Fatistic Ventures, I'm interested in ${clean(
        productName,
    )} (₦${clean(priceNaira)}). Is it available?`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encoded}`;
}
