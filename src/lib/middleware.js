import { NextResponse } from "next/server";
import { getAdminFromToken } from "@/lib/auth";

export async function requireAdmin(req) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            ),
        };
    }

    const token = authHeader.split(" ")[1];
    const admin = await getAdminFromToken(token);

    if (!admin) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: "Invalid token" },
                { status: 401 },
            ),
        };
    }

    return { authorized: true, admin };
}
