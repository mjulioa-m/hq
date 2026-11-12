import Link from "next/link";
import { cn } from "@/lib/cn";

export function Pill({
  active,
  children,
  href,
  onClick,
  count,
}: {
  active?: boolean;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  count?: number;
}) {
  const className = cn(
    "inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm transition",
    active ? "bg-accent font-medium text-accent-ink" : "glass text-ink-2 hover:text-ink"
  );
  const inner = (
    <>
      {children}
      {count !== undefined ? <span className={active ? "text-accent-ink/70" : "text-ink-3"}>{count}</span> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
