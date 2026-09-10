import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";
import { loginSchema, unpack } from "@/lib/validation";
import { requireSameOrigin } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";

export async function POST(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const ip = clientIp(req);
        // Strict limit on authentication attempts (per IP + 5-min window).
        const limiter = rateLimit(`auth:login:${ip}`, 10, 5 * 60_000);
        if (!limiter.ok) {
            await securityLog({
                action: LOG_ACTIONS.rateLimited,
                category: "auth",
                ip,
                outcome: "blocked",
                detail: { target: "admin-login" },
            });
            return NextResponse.json(
                { error: "Too many sign-in attempts. Please try again in a few minutes." },
                { status: 429 },
            );
        }

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(loginSchema, body);
        const identifier = parsed.username || parsed.email || "";

        const result = await authenticateAdmin({
            email: parsed.email,
            username: parsed.username,
            password: parsed.password,
        });

        if (!result) {
            await securityLog({
                actor: identifier,
                action: LOG_ACTIONS.adminLoginFailed,
                category: "auth",
                ip,
                outcome: "failed",
            });
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 },
            );
        }

        await securityLog({
            actor: result.email,
            actorRole: "admin",
            action: LOG_ACTIONS.adminLoginSuccess,
            category: "auth",
            ip,
            outcome: "success",
        });

        // Secure the admin token: set on the client app only (localStorage) —
        // never in a cookie, and never in server logs.
        return NextResponse.json({
            token: result.token,
            user: {
                id: result.id,
                email: result.email,
                role: result.role,
            },
        });
    } catch (e) {
        console.error("[auth:login] error", e);
        const message =
            e?.validation
                ? e.message
                : "Sign in failed. Please try again.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}