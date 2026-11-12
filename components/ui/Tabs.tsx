import { Pill } from "@/components/ui/Pill";

export function Tabs({
  items,
}: {
  items: { href: string; label: string; active: boolean; count?: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Pill key={item.href} href={item.href} active={item.active} count={item.count}>
          {item.label}
        </Pill>
      ))}
    </div>
  );
}
