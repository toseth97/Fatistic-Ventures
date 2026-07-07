import GlassPanel from "./GlassPanel";

export default function GlassCard({ className = "", children }) {
    return <GlassPanel className={"p-4 " + className}>{children}</GlassPanel>;
}
