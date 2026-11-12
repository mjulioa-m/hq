import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="glass min-w-[140px] flex-1 px-4 py-3">
      <p className="text-[10px] font-medium tracking-[0.14em] text-ink-3 uppercase">{label}</p>
      <p className="display mt-1 text-[28px] leading-none">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return <div className={cn("flex flex-wrap items-stretch gap-2")}>{children}</div>;
}
