import Link from "next/link";
import { dayNumber, todayISO, upcomingDays, weekdayShort } from "@/lib/dates";
import { cn } from "@/lib/cn";

export function WeekStrip({
  daysWithTasks,
  query,
}: {
  daysWithTasks: string[];
  query: string;
}) {
  const today = todayISO();
  const days = upcomingDays(7, today);
  const extra = query ? `&${query}` : "";
  return (
    <div className="glass flex gap-1 overflow-x-auto p-1.5">
      {days.map((iso) => {
        const active = iso === today;
        return (
          <Link
            key={iso}
            href={`/tareas?d=${iso}${extra}`}
            aria-current={active ? "date" : undefined}
            aria-label={`${weekdayShort(iso)} ${dayNumber(iso)}${daysWithTasks.includes(iso) ? ", con tareas" : ""}`}
            className={cn(
              "flex h-12 min-w-16 flex-col items-center justify-center rounded-[10px] text-xs transition-colors duration-150",
              active ? "bg-accent text-accent-ink" : "text-ink-2 hover:bg-white/5"
            )}
          >
            <span className="flex items-center gap-1">
              {weekdayShort(iso)} {!active && daysWithTasks.includes(iso) ? <span className="h-1 w-1 rounded-full bg-accent" /> : null}
            </span>
            <span className="text-sm font-medium">{dayNumber(iso)}</span>
          </Link>
        );
      })}
    </div>
  );
}
