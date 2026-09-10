// Server-side formatting helpers (shared, dependency-free).

export function formatNaira(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return "₦0";
    return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatRelativeTime(value) {
    if (!value) return "";
    const d = new Date(value);
    const diff = Date.now() - d.getTime();
    if (Number.isNaN(diff) || diff < 0) return formatDate(value);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return formatDate(value);
}