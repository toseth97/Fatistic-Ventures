export default function GlassPanel({ className = "", children }) {
    return (
        <div
            className={
                "backdrop-blur-md bg-white/10 border border-white/20 shadow-glass-lg rounded-glass-lg " +
                className
            }
        >
            {children}
        </div>
    );
}
