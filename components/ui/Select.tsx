import { cn } from "@/lib/cn";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-base text-ink transition-colors duration-150 ease-out focus:border-accent/60 aria-invalid:border-danger/70",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
