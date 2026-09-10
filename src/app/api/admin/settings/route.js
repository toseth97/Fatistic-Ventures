import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import { requireAdmin } from "@/lib/middleware";
import { requireSameOrigin, sanitizeText } from "@/lib/http";
import { securityLog, LOG_ACTIONS } from "@/lib/securityLog";
import { clientIp } from "@/lib/rateLimit";

await connectDB().catch(() => null);

const ALLOWED_KEYS = new Set(["hero", "banners", "site", "perks"]);

// Recursively sanitize text fields in the settings payload (defense against XSS).
function sanitizeValue(value, depth = 0) {
    if (depth > 6) return "";
    if (typeof value === "string") return sanitizeText(value, { max: 3000 });
    if (Array.isArray(value)) {
        const arr = value.slice(0, 20).map((v) => sanitizeValue(v, depth + 1));
        return arr;
    }
    if (value && typeof value === "object") {
        const out = {};
        for (const key of Object.keys(value).slice(0, 30)) {
            if (["google", "account", "password", "token", "secret"].includes(key.toLowerCase())) continue;
            out[key] = sanitizeValue(value[key], depth + 1);
        }
        return out;
    }
    if (typeof value === "boolean" || typeof value === "number") return value;
    return "";
}

export async function GET(req) {
    try {
        const { authorized, response } = await requireAdmin(req);
        if (!authorized) return response;
        const docs = await SiteSetting.find({}).lean();
        const settings = {};
        for (const doc of docs) settings[doc.key] = doc.value;
        return NextResponse.json({ settings });
    } catch (e) {
        console.error("[admin:settings] GET error", e);
        return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const { authorized, response, admin } = await requireAdmin(req);
        if (!authorized) return response;

        const body = await req.json().catch(() => ({}));
        const incoming = body?.settings || {};
        const allowed = {};
        for (const key of Object.keys(incoming).slice(0, 10)) {
            if (ALLOWED_KEYS.has(key)) allowed[key] = sanitizeValue(incoming[key]);
        }
        if (!Object.keys(allowed).length) {
            return NextResponse.json({ error: "No valid settings provided" }, { status: 400 });
        }

        for (const [key, value] of Object.entries(allowed)) {
            await SiteSetting.updateOne(
                { key },
                { $set: { value, updatedBy: admin?.email || "admin" } },
                { upsert: true },
            );
        }

        await securityLog({
            actor: admin?.email || "admin",
            action: LOG_ACTIONS.settingsUpdate,
            category: "admin",
            ip: clientIp(req),
            detail: { keys: Object.keys(allowed) },
        });

        return NextResponse.json({ ok: true, updated: Object.keys(allowed) });
    } catch (e) {
        console.error("[admin:settings] PUT error", e);
        return NextResponse.json(
            { error: e?.message || "Failed to save settings" },
            { status: 400 },
        );
    }
}