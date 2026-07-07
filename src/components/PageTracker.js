"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Track page views (excluding admin pages)
        if (pathname && !pathname.startsWith("/admin")) {
            fetch("/api/analytics/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "page_view",
                    productId: undefined,
                    meta: {
                        device: /Mobi|Android|iPhone|iPad/i.test(
                            navigator.userAgent,
                        )
                            ? "mobile"
                            : "desktop",
                    },
                }),
            }).catch(() => {});
        }
    }, [pathname]);

    return null;
}
