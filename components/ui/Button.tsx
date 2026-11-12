import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Button({
  children,
  className,
  tone = "accent",
  type = "button",
  loading = false,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "accent" | "ghost" | "danger";
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-medium transition-[background-color,filter,transform] duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        tone === "accent" && "bg-accent text-accent-ink hover:brightness-105",
        tone === "ghost" && "glass text-ink hover:bg-white/10",
        tone === "danger" && "bg-danger/90 text-white hover:bg-danger",
        className
      )}
      {...props}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
