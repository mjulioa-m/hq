import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteEntry, EntryForm, MonthChart } from "@/components/finance/FinanceDashboard";
import { SceneHero } from "@/components/scene/SceneHero";
import { StatCard, StatRow } from "@/components/ui/StatCard";
import { SHOW_FINANCE } from "@/lib/constants";
import { lastMonths, monthKey, monthLabel, monthRange, shiftMonth } from "@/lib/dates";
import { listEntries, monthlySeries, summarize } from "@/lib/finance";
import { formatCOP } from "@/lib/money";
import { formatShort } from "@/lib/dates";
import { listProjects, resolveProjectId } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; mes?: string }>;
}) {
  if (!SHOW_FINANCE) redirect("/");
  const sp = await searchParams;
  const mes = sp.mes && /^\d{4}-\d{2}$/.test(sp.mes) ? sp.mes : monthKey();
  const projectId = await resolveProjectId(sp.p);
  const projects = await listProjects();
  const range = monthRange(mes);
  const entries = await listEntries({ projectId, from: range.from, to: range.to });
  const totals = summarize(entries);
  const series = await monthlySeries(projectId, lastMonths(6, mes));
  const byProject = projects.map((project) => ({
    project,
    ...summarize(entries.filter((e) => e.projectId === project.id)),
  }));
  const byCategory = new Map<string, number>();
  for (const entry of entries) {
    const sign = entry.type === "gasto" ? -1 : 1;
    byCategory.set(entry.category, (byCategory.get(entry.category) ?? 0) + sign * Number(entry.amount));
  }
  const q = (month: string) => {
    const params = new URLSearchParams();
    if (sp.p) params.set("p", sp.p);
    params.set("mes", month);
    return `/finanzas?${params.toString()}`;
  };
  return (
    <div>
      <SceneHero scene="finanzas" title="Finanzas" subtitle={monthLabel(mes)} />
      <div className="mt-4 mb-4 flex gap-3 text-sm">
        <Link href={q(shiftMonth(mes, -1))}>← Mes anterior</Link>
        <Link href={q(shiftMonth(mes, 1))}>Mes siguiente →</Link>
      </div>
      <StatRow>
        <StatCard label="Ingresos" value={formatCOP(totals.income)} />
        <StatCard label="Gastos" value={formatCOP(totals.expense)} />
        <StatCard label="Balance" value={formatCOP(totals.balance)} />
      </StatRow>
      <section className="glass mt-4 p-4">
        <h2 className="mb-2 text-sm text-ink-2">Últimos 6 meses</h2>
        <MonthChart rows={series} />
        <p className="mt-2 text-xs text-ink-3">Verde: ingresos. Crema: gastos.</p>
      </section>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="glass p-4">
          <h2 className="mb-2 font-medium">Por proyecto</h2>
          <ul className="space-y-2 text-sm">
            {byProject.map(({ project, balance }) => (
              <li key={project.id} className="flex justify-between">
                <span>{project.name}</span>
                <span>{formatCOP(balance)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="glass p-4">
          <h2 className="mb-2 font-medium">Por categoría</h2>
          <ul className="space-y-2 text-sm">
            {[...byCategory.entries()].map(([category, amount]) => (
              <li key={category} className="flex justify-between">
                <span>{category}</span>
                <span>{formatCOP(amount)}</span>
              </li>
            ))}
            {byCategory.size === 0 ? <li className="text-ink-3">Sin movimientos este mes.</li> : null}
          </ul>
        </section>
      </div>
      <div className="mt-4">
        <EntryForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} defaultProjectId={projectId} />
      </div>
      <section className="glass overflow-x-auto p-2">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-ink-3 uppercase">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Categoría</th>
              <th>Detalle</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-white/10">
                <td className="px-3 py-2">{formatShort(entry.entryDate)}</td>
                <td>{entry.type}</td>
                <td>{formatCOP(entry.amount)}</td>
                <td>{entry.category}</td>
                <td>{entry.description}</td>
                <td>
                  <DeleteEntry id={entry.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
