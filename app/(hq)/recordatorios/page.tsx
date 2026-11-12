import { ReminderBoard, type ReminderCard } from "@/components/reminders/ReminderBoard";
import { SceneHero } from "@/components/scene/SceneHero";
import { isReminderUnit } from "@/lib/reminder-schedule";
import { listReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

export default async function RecordatoriosPage() {
  const items = await listReminders();
  const cards: ReminderCard[] = items.flatMap((item) => {
    if (!isReminderUnit(item.everyUnit)) return [];
    return [
      {
        id: item.id,
        name: item.name,
        everyAmount: item.everyAmount,
        everyUnit: item.everyUnit,
        nextAt: item.nextAt.toISOString(),
      },
    ];
  });
  return (
    <div>
      <SceneHero
        scene="login"
        title="Recordatorios"
        subtitle="Un nombre y cada cuánto quieres que vuelva a tocar."
      />
      <div className="mt-4">
        <ReminderBoard items={cards} />
      </div>
    </div>
  );
}
