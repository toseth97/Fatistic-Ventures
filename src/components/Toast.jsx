"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext({ show: () => {} });

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (message, type = "success") => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToasts((prev) => [
                ...prev.slice(-3),
                { id, message: String(message || ""), type },
            ]);
            setTimeout(() => dismiss(id), 4500);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="toast" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className="toast-item">
                        <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                                t.type === "error"
                                    ? "bg-danger/90"
                                    : t.type === "info"
                                      ? "bg-info"
                                      : "bg-emerald-500"
                            }`}
                        >
                            {t.type === "error" ? "✕" : t.type === "info" ? "i" : "✓"}
                        </span>
                        <p className="flex-1 text-sm leading-snug">{t.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="text-white/60 hover:text-white transition-colors"
                            aria-label="Dismiss notification"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}