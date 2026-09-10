// In-memory sliding-window rate limiter for API routes.
// Note: in-memory state resets on server restart. For multi-instance deployments,
// replace with a shared store (e.g. Redis). Kept intentionally small and dependency-free.
const buckets = new Map();

function now() {
    return Date.now();
}

/**
 * @param {string} key - unique key, e.g. `auth:login:1.2.3.4`
 * @param {number} limit - max number of requests allowed in the window
 * @param {number} windowMs - window duration in milliseconds
 * @returns {{ ok: boolean, retryAfterMs: number, remaining: number }}
 */
export function rateLimit(key, limit = 60, windowMs = 60_000) {
    const current = now();
    const entry = buckets.get(key);

    if (!entry || current - entry.resetAt >= windowMs) {
        buckets.set(key, { count: 1, resetAt: current + windowMs });
        return { ok: true, retryAfterMs: 0, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
        return {
            ok: false,
            retryAfterMs: Math.max(0, entry.resetAt - current),
            remaining: 0,
        };
    }

    entry.count += 1;
    return { ok: true, retryAfterMs: 0, remaining: limit - entry.count };
}

// Periodic cleanup to avoid unbounded memory growth
export function initRateLimitCleanup(intervalMs = 10 * 60 * 1000) {
    if (global.__rateLimitCleanupStarted) return;
    global.__rateLimitCleanupStarted = true;
    const timer = setInterval(() => {
        const cutoff = now() - 60 * 60 * 1000;
        for (const [key, entry] of buckets) {
            if (entry.resetAt < cutoff) buckets.delete(key);
        }
    }, intervalMs);
    if (timer.unref) timer.unref();
}

initRateLimitCleanup();

export function clientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for") || "";
    if (forwarded) return String(forwarded).split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}