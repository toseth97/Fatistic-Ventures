export default function GlassInput({ className = "", ...props }) {
    return (
        <input
            className={
                "w-full px-4 py-3 rounded-glass-sm border border-white/20 bg-white/10 text-cream " +
                "placeholder:text-white/50 backdrop-blur-md shadow-glass-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 " +
                className
            }
            {...props}
        />
    );
}
