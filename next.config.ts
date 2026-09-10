import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// CSP: strict but functional for this app.
// - 'unsafe-inline' for style is required by Tailwind/Next inline styles.
// - 'unsafe-inline' for script is required by Next.js App Router's streaming
//   bootstrap inline script. All user/admin content is rendered with escaping,
//   so input sanitization — not the CSP alone — is the primary XSS defense.
// ---------------------------------------------------------------------------
const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.paystack.co https://oauth2.googleapis.com https://accounts.google.com",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    "frame-src https://checkout.paystack.com",
    "object-src 'none'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
].join("; ");

const securityHeaders: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Content-Security-Policy": csp,
};

if (isProduction) {
    securityHeaders["Strict-Transport-Security"] =
        "max-age=63072000; includeSubDomains; preload";
}

const nextConfig: NextConfig = {
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "*.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: Object.entries(securityHeaders).map(([key, value]) => ({
                    key,
                    value,
                })),
            },
        ];
    },
};

export default nextConfig;