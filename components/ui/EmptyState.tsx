import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-1 px-6 py-10 text-center">
      {Icon ? (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-ink-2">
          <Icon size={20} aria-hidden />
        </span>
      ) : null}
      <p className="text-base font-medium text-ink">{title}</p>
      {description ? <p className="max-w-sm text-sm text-ink-3">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
