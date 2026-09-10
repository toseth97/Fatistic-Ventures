import crypto from "crypto";

// ---------------------------------------------------------------------------
// Paystack client (server-side only). Secret key is NEVER exposed to the client.
// All payment confirmation happens server-side via the official API or webhooks.
// ---------------------------------------------------------------------------

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey() {
    return process.env.PAYSTACK_SECRET_KEY || "";
}

export function isPaystackConfigured() {
    return Boolean(secretKey() && process.env.NEXT_PUBLIC_SITE_URL);
}

export function paystackPublicKey() {
    return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
}

async function paystackFetch(path, options = {}) {
    const key = secretKey();
    if (!key) throw new Error("Paystack is not configured");
    const res = await fetch(`${PAYSTACK_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === false) {
        const err = new Error(data.message || "Payment provider error");
        err.status = 502;
        err.paystack = data;
        throw err;
    }
    return data;
}

/**
 * Initialize a Paystack transaction. amount is in NGN (kobo conversion is done here).
 */
export async function initializePaystackTransaction({
    email,
    amountNaira,
    reference,
    callbackUrl,
    metadata = {},
}) {
    const amountKobo = Math.round(Number(amountNaira) * 100);
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
        throw new Error("Invalid payment amount");
    }
    const data = await paystackFetch("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
            email,
            amount: amountKobo,
            reference,
            currency: "NGN",
            callback_url: callbackUrl,
            metadata,
        }),
    });
    return data.data; // { authorization_url, access_code, reference }
}

/**
 * Server-side verification of a payment reference. NEVER trust browser input;
 * always confirm with the provider.
 */
export async function verifyPaystackTransaction(reference) {
    return paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/**
 * Validate a Paystack webhook.
 * The provider signs the raw request body with its secret key using HMAC-SHA512
 * and sends it in the x-paystack-signature header.
 */
export function isValidPaystackWebhook(rawBody, signature) {
    const key = secretKey();
    if (!key || !rawBody || !signature) return false;
    const expected = crypto
        .createHmac("sha512", key)
        .update(rawBody, "utf8")
        .digest("hex");
    const provided = String(signature || "").trim();
    if (expected.length !== provided.length) return false;
    // Constant-time comparison
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}