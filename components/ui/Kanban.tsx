"use client";

export function Kanban({
  columns,
}: {
  columns: {
    id: string;
    title: string;
    count?: number;
    cards: { id: string; body: React.ReactNode }[];
  }[];
  onMove?: (id: string, columnId: string) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map((col) => (
        <section key={col.id} className="glass w-64 shrink-0 p-3">
          <header className="mb-3 flex items-center justify-between text-sm">
            <h3>{col.title}</h3>
            <span className="text-ink-3">{col.count ?? col.cards.length}</span>
          </header>
          <div className="space-y-2">
            {col.cards.map((card) => (
              <article key={card.id} className="rounded-xl bg-black/25 p-3 text-sm">
                {card.body}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function DropColumn({
  id,
  title,
  count,
  onDropId,
  children,
}: {
  id: string;
  title: string;
  count: number;
  onDropId: (cardId: string, columnId: string) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className="glass w-64 shrink-0 p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text/plain");
        if (cardId) onDropId(cardId, id);
      }}
    >
      <header className="mb-3 flex items-center justify-between text-sm">
        <h3>{title}</h3>
        <span className="text-ink-3">{count}</span>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
