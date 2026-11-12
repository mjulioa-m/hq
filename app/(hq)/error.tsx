"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HqError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlert}
      title="No pudimos cargar esta sección"
      description="Revisa tu conexión e intenta de nuevo."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => retry()}>Intentar de nuevo</Button>
          <Link href="/" className="inline-flex h-10 items-center justify-center rounded-[10px] px-4 text-sm font-medium text-ink-2 hover:text-ink">
            Volver al inicio
          </Link>
        </div>
      }
    />
  );
}
