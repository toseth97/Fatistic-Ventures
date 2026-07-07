export default function GlassModal({ open, onClose, title, children, footer }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                aria-label="Close modal"
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl rounded-glass-lg">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-glass-lg rounded-glass-lg overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <div className="text-display text-cream text-xl font-semibold">
                            {title}
                        </div>
                    </div>
                    <div className="p-4">{children}</div>
                    {footer ? (
                        <div className="p-4 border-t border-white/10">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
