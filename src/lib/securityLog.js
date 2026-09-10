import { connectDB } from "@/lib/db";

// Best-effort security audit logging. Never blocks the request path on a DB failure,
// and deliberately does not accept secrets (passwords, tokens, cards) as arguments.
export async function securityLog({
    actor = "anonymous",
    actorRole = "",
    action,
    category = "security",
    targetId = "",
    ip = "",
    userAgent = "",
    outcome = "success",
    detail = {},
}) {
    try {
        await connectDB();
        const SecurityLog = (await import("@/models/SecurityLog")).default;
        await SecurityLog.create({
            actor: String(actor || "anonymous").slice(0, 120),
            actorRole,
            action: String(action).slice(0, 120),
            category,
            targetId: String(targetId || "").slice(0, 120),
            ip: String(ip || "").slice(0, 60),
            userAgent: String(userAgent || "").slice(0, 400),
            outcome,
            detail,
        });
    } catch (e) {
        console.error("[securityLog] failed to persist", e?.message);
    }
}

export const LOG_ACTIONS = {
    adminLoginSuccess: "admin.login.success",
    adminLoginFailed: "admin.login.failed",
    adminLogout: "admin.logout",
    productCreate: "product.create",
    productUpdate: "product.update",
    productDelete: "product.delete",
    categoryCreate: "category.create",
    categoryUpdate: "category.update",
    categoryDelete: "category.delete",
    orderCreate: "order.create",
    orderStatusUpdate: "order.status.update",
    upload: "media.upload",
    mediaDelete: "media.delete",
    settingsUpdate: "settings.update",
    rateLimited: "security.rate.limited",
    crossOriginBlocked: "security.csrf.blocked",
    unauthorizedAdmin: "security.unauthorized.admin",
    paymentVerified: "payment.verified",
};