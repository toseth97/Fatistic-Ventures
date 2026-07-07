import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AdminUser from "@/models/AdminUser";
import { connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function authenticateAdmin({ email, username, password } = {}) {
    // Hardcoded admin credentials
    const HARDCODED_USER = "fatistic_admin";
    const HARDCODED_PASS = "FatisticAdmin$";

    if (
        username &&
        String(username).toLowerCase() === HARDCODED_USER &&
        password === HARDCODED_PASS
    ) {
        return {
            id: "hardcoded_admin",
            email: "admin@fatistic.com",
            role: "admin",
            token: signToken({
                id: "hardcoded_admin",
                email: "admin@fatistic.com",
                role: "admin",
            }),
        };
    }

    // Backward compatible DB-based flow (email/password)
    if (!email) return null;

    await connectDB();
    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!user) return null;

    const valid = await verifyPassword(password, user.hashedPassword);
    if (!valid) return null;

    return {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        token: signToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        }),
    };
}

export async function getAdminFromToken(token) {
    const payload = verifyToken(token);
    if (!payload) return null;
    return payload;
}
