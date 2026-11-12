import Link from "next/link";

export function QuickCounters({
  decisions,
  tasks,
  reminders,
  pressure,
}: {
  decisions: number;
  tasks: number;
  reminders: number;
  pressure: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/presion" className="glass min-h-14 px-3 py-2 text-sm transition-colors duration-150 ease-out hover:bg-surface-2">
        <span className="text-ink-3">Presión</span>
        <span className="mt-0.5 block font-medium">{pressure} de 3 hoy</span>
      </Link>
      <Link href="/recordatorios" className="glass min-h-14 px-3 py-2 text-sm transition-colors duration-150 ease-out hover:bg-surface-2">
        <span className="text-ink-3">Avisos</span>
        <span className="mt-0.5 block font-medium">
          {reminders === 0 ? "Al día" : `${reminders} ${reminders === 1 ? "toca ahora" : "tocan ahora"}`}
        </span>
      </Link>
      <Link href="/decidir" className="glass min-h-14 px-3 py-2 text-sm transition-colors duration-150 ease-out hover:bg-surface-2">
        <span className="text-ink-3">Te toca decidir</span>
        <span className="mt-0.5 block font-medium">{decisions} {decisions === 1 ? "cosa" : "cosas"}</span>
      </Link>
      <Link href="/tareas" className="glass min-h-14 px-3 py-2 text-sm transition-colors duration-150 ease-out hover:bg-surface-2">
        <span className="text-ink-3">Hoy</span>
        <span className="mt-0.5 block font-medium">{tasks} por hacer</span>
      </Link>
    </div>
  );
}
