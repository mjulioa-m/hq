import { cn } from "@/lib/cn";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "hot" | "ok" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "neutral" && "bg-white/10 text-ink-2",
        tone === "hot" && "bg-accent text-accent-ink",
        tone === "ok" && "bg-ok/20 text-ok",
        tone === "danger" && "bg-danger/20 text-danger"
      )}
    >
      {children}
    </span>
  );
}
