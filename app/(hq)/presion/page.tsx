import { PressureBoard, type PressureCard } from "@/components/pressure/PressureBoard";
import { SceneHero } from "@/components/scene/SceneHero";
import { PRESSURE_SLOTS, type PressureSlot } from "@/lib/db/schema";
import { formatLong, todayISO } from "@/lib/dates";
import { listPressureReadings } from "@/lib/pressure";
import { listReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

function toCard(row: {
  id: string;
  day: string;
  slot: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  note: string;
}): PressureCard | null {
  if (!(PRESSURE_SLOTS as readonly string[]).includes(row.slot)) return null;
  return {
    id: row.id,
    day: row.day,
    slot: row.slot as PressureSlot,
    systolic: row.systolic,
    diastolic: row.diastolic,
    pulse: row.pulse,
    note: row.note,
  };
}

export default async function PresionPage() {
  const today = todayISO();
  const [rows, reminders] = await Promise.all([listPressureReadings(), listReminders()]);
  const cards = rows.flatMap((row) => {
    const card = toCard(row);
    return card ? [card] : [];
  });
  const todayItems = cards.filter((item) => item.day === today);
  const pastDays = [...new Set(cards.filter((item) => item.day !== today).map((item) => item.day))];
  const history = pastDays.map((day) => ({
    day,
    label: formatLong(day),
    items: cards.filter((item) => item.day === day),
  }));
  const reminder = reminders.find((item) => /presi[oó]n|tensi[oó]n|tamiz/i.test(item.name));

  return (
    <div>
      <SceneHero scene="login" title="Tamizaje" subtitle="Presión arterial, tres veces al día." />
      <div className="mt-4">
        <PressureBoard today={today} todayItems={todayItems} history={history} reminderName={reminder?.name ?? null} />
      </div>
    </div>
  );
}
