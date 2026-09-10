import { NextResponse } from "next/server";
import { getAdminFromToken } from "@/lib/auth";

// Robust admin authorization guard. Returns { authorized: false, response } with
// a proper HTTP 401/403 when the caller is not an admin.
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

    const token = authHeader.split(" ").slice(1).join(" ").trim();
    const admin = await getAdminFromToken(token);

    if (!admin) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: "Session expired. Please sign in again." },
                { status: 401 },
            ),
        };
    }

    if (admin.role !== "admin") {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            ),
        };
    }

    return { authorized: true, admin };
}

// Convenience helper for route files to reduce boilerplate.
export async function getAdminSession(req) {
    const result = await requireAdmin(req);
    return result;
}
