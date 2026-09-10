// Lightweight inline SVG icon set (dependency-free).

const base = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
};

export function IconBag({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d="M6 7h12l1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5L6 7Z" />
            <path d="M9 10V6a3 3 0 0 1 6 0v4" />
        </svg>
    );
}

export function IconSearch({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
        </svg>
    );
}

export function IconUser({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
    );
}

export function IconMenu({ className = "h-6 w-6" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
    );
}

export function IconClose({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

export function IconChevron({ className = "h-4 w-4", dir = "right" }) {
    const d =
        dir === "left" ? "m15 18-6-6 6-6" : dir === "up" ? "m18 15-6-6-6 6" : "m9 18 6-6-6-6";
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d={d} />
        </svg>
    );
}

export function IconCheck({ className = "h-5 w-5" }) {
    return (
        <svg {...base} strokeWidth={2.2} className={className} aria-hidden="true">
            <path d="m5 12 4.5 4.5L19 7" />
        </svg>
    );
}

export function IconTruck({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d="M3 6h11v10H3z" />
            <path d="M14 9h4l3 3v4h-7z" />
            <circle cx="7" cy="18" r="1.6" />
            <circle cx="17" cy="18" r="1.6" />
        </svg>
    );
}

export function IconLock({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

export function IconShield({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

export function IconTrash({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M10 11v6M14 11v6" />
            <path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 20l1-13" />
            <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
        </svg>
    );
}

export function IconStar({ className = "h-4 w-4", filled = false }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.6l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6Z"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    );
}

export function IconWhatsApp({ className = "h-5 w-5" }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
    );
}

export function IconStore({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <path d="M4 10h16l-1.5-6H5.5L4 10Z" />
            <path d="M4 10v10h16V10" />
            <path d="M8 14h8" />
        </svg>
    );
}

export function IconDashboard({ className = "h-5 w-5" }) {
    return (
        <svg {...base} className={className} aria-hidden="true">
            <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
            <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
            <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
            <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
        </svg>
    );
}