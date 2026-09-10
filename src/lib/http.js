import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Consistent HTTP helpers: safe error responses (no stack traces leaked) and
// same-origin protection for state-changing requests.
// ---------------------------------------------------------------------------

export function jsonOk(data, status = 200) {
    return NextResponse.json(data, { status });
}

export function jsonError(message, status = 400, extra = null) {
    const body = { error: message };
    if (extra && process.env.NODE_ENV === "development") {
        body.details = extra;
    }
    return NextResponse.json(body, { status });
}

export function unhandledError(e) {
    // Log technical detail server-side only; never send to the client.
    console.error("[unhandled-error]", e);
    return jsonError("Something went wrong. Please try again.", 500);
}

/**
 * Reject cross-origin state-changing requests (CSRF defense-in-depth).
 * SameSite=LAX cookies already block cross-site sends of auth cookies; this adds
 * an explicit Origin check for requests that do carry credentials or tokens.
 */
export function isSameOrigin(req) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!origin) return true; // non-browser clients (curl), our own server-side calls
    if (!host) return false;
    try {
        const parsed = new URL(origin);
        return parsed.host === host;
    } catch {
        return false;
    }
}

export function requireSameOrigin(req) {
    if (!isSameOrigin(req)) {
        return jsonError("Cross-origin request rejected", 403);
    }
    return null;
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const MAX_STRING = 20_000;

export function cleanString(value, { max = 5000, allowNewlines = true } = {}) {
    if (value === null || value === undefined) return "";
    let s = String(value).trim();
    if (!allowNewlines) s = s.replace(/[\r\n\t]+/g, " ");
    // Strip control characters (keeps normal text, neutralizes most injection attempts)
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    if (s.length > max) s = s.slice(0, max);
    return s;
}

export function toSlug(input) {
    const s = String(input || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06FF\u00C0-\u024F\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return s || "item";
}

export function isMongoId(id) {
    return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

// Sanitize a single page of user-entered plain text for safe rendering (React escapes by default).
// This strips obvious script-adjacent sequences as a secondary layer of defense.
export function sanitizeText(value, { max = 5000 } = {}) {
    let s = cleanString(value);
    if (s.length > max) s = s.slice(0, max);
    return s
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function cleanNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    if (value === null || value === undefined || value === "") return 0;
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    if (n < min) return min;
    if (n > max) return max;
    return Math.round(n * 100) / 100;
}

export function cleanInt(value, { min = 0, max = 1_000_000 } = {}) {
    const raw = cleanNumber(value);
    const n = Math.round(raw);
    if (n < min) return min;
    if (n > max) return max;
    return Number.isFinite(n) ? n : 0;
}