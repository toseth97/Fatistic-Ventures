"use client";

import { useEffect, useMemo, useState } from "react";

export default function HeroTextAnimator({
    title,
    subtitle,
    titleClassName = "",
    subtitleClassName = "",
}) {
    const [mounted, setMounted] = useState(false);
    const [titleAnim, setTitleAnim] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            setMounted(true);
            setTitleAnim(true);
        });
        return () => cancelAnimationFrame(id);
    }, []);

    const chars = useMemo(() => {
        if (!title) return [];
        return String(title).split("");
    }, [title]);

    return (
        <div>
            <div className={titleClassName} aria-label={title}>
                <span className="inline-block">
                    {chars.map((ch, i) => {
                        const delay = i * 18;
                        return (
                            <span
                                key={`${ch}-${i}`}
                                style={{
                                    opacity: titleAnim ? 1 : 0,
                                    transform: titleAnim
                                        ? "translateY(0px)"
                                        : "translateY(10px)",
                                    transition: mounted
                                        ? `opacity 520ms ease ${delay}ms, transform 520ms ease ${delay}ms`
                                        : "none",
                                    color: "inherit",
                                    display:
                                        ch === " "
                                            ? "inline-block"
                                            : "inline-block",
                                    width: ch === " " ? "0.35em" : undefined,
                                }}
                            >
                                {ch}
                            </span>
                        );
                    })}
                </span>
            </div>

            {subtitle ? (
                <div
                    className={subtitleClassName}
                    style={{
                        opacity: titleAnim ? 1 : 0,
                        transform: titleAnim
                            ? "translateY(0px)"
                            : "translateY(10px)",
                        transition: mounted
                            ? "opacity 650ms ease 220ms, transform 650ms ease 220ms"
                            : "none",
                    }}
                >
                    {subtitle}
                </div>
            ) : null}

            {/* spacer */}
            <div className="h-0.5" aria-hidden />
        </div>
    );
}
