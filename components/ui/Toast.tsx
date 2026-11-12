"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastInput = { tone: "ok" | "error"; message: string };
type ToastItem = ToastInput & { id: string };

const ToastContext = createContext<{ notify: (input: ToastInput) => void } | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast fuera de ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      setItems((current) => [...current.slice(-2), { ...input, id }]);
      if (input.tone === "ok") {
        timers.current.set(
          id,
          window.setTimeout(() => dismiss(id), 3500)
        );
      }
    },
    [dismiss]
  );

  const okItems = items.filter((item) => item.tone === "ok");
  const errorItems = items.filter((item) => item.tone === "error");

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 md:bottom-24">
        <div aria-live="polite" className="flex w-full flex-col items-center gap-2">
          {okItems.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
          ))}
        </div>
        {errorItems.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const ok = item.tone === "ok";
  return (
    <div role={ok ? undefined : "alert"} className="glass-strong shadow-soft pointer-events-auto flex max-w-md items-center gap-2 px-4 py-3 text-sm">
      {ok ? <CircleCheck size={18} className="shrink-0 text-ok" aria-hidden /> : <CircleAlert size={18} className="shrink-0 text-danger" aria-hidden />}
      <p className="min-w-0 flex-1">{item.message}</p>
      {ok ? null : (
        <button type="button" aria-label="Cerrar aviso" onClick={onDismiss} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
