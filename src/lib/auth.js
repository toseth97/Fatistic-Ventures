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
    const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
    const normalizedUsername = username
        ? String(username).trim().toLowerCase()
        : null;

    if (!normalizedEmail && !normalizedUsername) return null;

    // Hardcoded fallback credentials
    const hardcodedUsername = "fatistic_admin";
    const hardcodedPassword = "FatisticAdmin$";

    if (
        normalizedUsername === hardcodedUsername &&
        password === hardcodedPassword
    ) {
        return {
            id: "admin_hardcoded",
            email: "admin@fatistic.com",
            role: "admin",
            token: signToken({
                id: "admin_hardcoded",
                email: "admin@fatistic.com",
                role: "admin",
                username: hardcodedUsername,
            }),
        };
    }

    // DB-based flow
    await connectDB();

    const user = await AdminUser.findOne({
        $or: [
            normalizedEmail ? { email: normalizedEmail } : null,
            normalizedUsername ? { username: normalizedUsername } : null,
        ].filter(Boolean),
    });

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
