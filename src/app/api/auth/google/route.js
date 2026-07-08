import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

async function verifyIdToken(idToken) {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const tokenInfo = await res.json();
    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) return null;
    if (tokenInfo.exp && Number(tokenInfo.exp) < Date.now() / 1000) return null;
    return tokenInfo;
}

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const idToken = String(body?.idToken || "").trim();
        if (!idToken) {
            return NextResponse.json(
                { error: "Missing Google ID token" },
                { status: 400 },
            );
        }

        const tokenInfo = await verifyIdToken(idToken);
        if (!tokenInfo) {
            return NextResponse.json(
                { error: "Invalid Google ID token" },
                { status: 401 },
            );
        }

        await connectDB();

        const user = await User.findOneAndUpdate(
            { googleId: tokenInfo.sub },
            {
                googleId: tokenInfo.sub,
                email: tokenInfo.email,
                name: tokenInfo.name || tokenInfo.email,
                picture: tokenInfo.picture || "",
                locale: tokenInfo.locale || "",
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        ).lean();

        return NextResponse.json(
            {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                },
            },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json(
            {
                error: "Google sign-in failed",
                details: e?.message || String(e),
            },
            { status: 500 },
        );
    }
}
