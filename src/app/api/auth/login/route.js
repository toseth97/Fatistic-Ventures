import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 },
            );
        }

        const result = await authenticateAdmin(email, password);

        if (!result) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 },
            );
        }

        return NextResponse.json(
            {
                token: result.token,
                user: { id: result.id, email: result.email, role: result.role },
            },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json(
            { error: "Login failed", details: e?.message || String(e) },
            { status: 500 },
        );
    }
}
