export default function GlassButton({
    className = "",
    variant = "gold",
    children,
    ...props
}) {
    const variantClasses =
        variant === "burgundy"
            ? "bg-burgundy-700/20 border-burgundy-400/30 text-cream hover:bg-burgundy-700/30"
            : variant === "emerald"
              ? "bg-emerald-700/20 border-emerald-400/30 text-cream hover:bg-emerald-700/30"
              : "bg-accent/20 border-accent/30 text-white hover:bg-accent/30";

    return (
        <button
            className={
                "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-glass-sm border shadow-glass-sm " +
                "backdrop-blur-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.99] " +
                variantClasses +
                " " +
                className
            }
            {...props}
        >
            {children}
        </button>
    );
}
