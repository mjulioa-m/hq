import Link from "next/link";
import { notFound } from "next/navigation";
import { DailyEditor } from "@/components/tasks/DailyEditor";
import { SceneHero } from "@/components/scene/SceneHero";
import { addDays, formatLongWithYear, isISODate } from "@/lib/dates";
import { getDaily } from "@/lib/daily";
import { tasksDoneOn } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function DiarioPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!isISODate(date)) notFound();
  const [note, done] = await Promise.all([getDaily(date), tasksDoneOn(date)]);
  const prev = addDays(date, -1);
  const next = addDays(date, 1);
  return (
    <div>
      <SceneHero scene="tareas" title="Diario" subtitle={formatLongWithYear(date)} />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="glass p-4">
          <div className="mb-3 flex justify-between text-sm">
            <Link href={`/diario/${prev}`}>← Anterior</Link>
            <Link href={`/diario/${next}`}>Siguiente →</Link>
          </div>
          <DailyEditor date={date} initial={note.content} />
        </section>
        <aside className="glass p-4">
          <h2 className="mb-2 font-medium">Hecho este día</h2>
          <ul className="space-y-2 text-sm text-ink-2">
            {done.length === 0 ? <li>Ninguna tarea cerrada.</li> : null}
            {done.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
