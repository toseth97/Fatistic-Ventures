import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AdminUser from "@/models/AdminUser";
import { connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    (adminUsername ? `${adminUsername}@fatistic.com` : "admin@fatistic.com");

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

    await connectDB();

    const lookupCriteria = {
        $or: [
            normalizedEmail ? { email: normalizedEmail } : null,
            normalizedUsername ? { username: normalizedUsername } : null,
        ].filter(Boolean),
    };

    let adminUser = await AdminUser.findOne(lookupCriteria);

    if (adminUsername && adminPassword && !adminUser) {
        adminUser = await AdminUser.findOne({
            $or: [{ username: adminUsername }, { email: adminEmail }],
        });
    }

    if (adminUsername && adminPassword && !adminUser) {
        adminUser = await AdminUser.create({
            username: adminUsername,
            email: adminEmail,
            hashedPassword: await hashPassword(adminPassword),
            role: "admin",
        });
    }

    if (!adminUser) return null;

    const valid = await verifyPassword(password, adminUser.hashedPassword);
    if (!valid) return null;

    await AdminUser.findByIdAndUpdate(adminUser._id, {
        $set: { lastLoginAt: new Date() },
    });

    return {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        token: signToken({
            id: adminUser._id.toString(),
            email: adminUser.email,
            role: adminUser.role,
        }),
    };
}

export async function getAdminFromToken(token) {
    const payload = verifyToken(token);
    if (!payload) return null;
    return payload;
}
