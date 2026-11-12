import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  strong = false,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return <div className={cn(strong ? "glass-strong" : "glass", className)}>{children}</div>;
}
