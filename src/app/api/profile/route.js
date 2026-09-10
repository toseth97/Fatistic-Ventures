import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { profileUpdateSchema, unpack } from "@/lib/validation";
import { requireSameOrigin, sanitizeText } from "@/lib/http";

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }
        await connectDB();
        const user = await User.findById(userId)
            .select("name email picture phone address locale createdAt lastLoginAt -_id")
            .lean();
        if (!user) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }
        return NextResponse.json({ user });
    } catch (e) {
        console.error("[profile] GET error", e);
        return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
    }
}

// Users may update non-security profile details only.
// OAuth identity (Google account, email) is never modifiable here.
export async function PUT(req) {
    try {
        const originError = requireSameOrigin(req);
        if (originError) return originError;

        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const parsed = unpack(profileUpdateSchema, body);

        const clean = {};
        if (parsed.name !== undefined) clean.name = sanitizeText(parsed.name);
        if (parsed.phone !== undefined)
            clean.phone = sanitizeText(parsed.phone, { max: 24, allowNewlines: false });
        if (parsed.address !== undefined)
            clean.address = sanitizeText(parsed.address, { max: 300 });

        if (Object.keys(clean).length === 0) {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findByIdAndUpdate(userId, { $set: clean }, { new: true })
            .select("name email picture phone address createdAt lastLoginAt")
            .lean();

        if (!user) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }
        return NextResponse.json({ user });
    } catch (e) {
        console.error("[profile] PUT error", e);
        return NextResponse.json(
            {
                error: e?.message || "Failed to update profile",
                details: process.env.NODE_ENV === "development" ? e.message : undefined,
            },
            { status: 400 },
        );
    }
}