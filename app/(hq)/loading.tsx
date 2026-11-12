import { Skeleton } from "@/components/ui/Skeleton";

export default function HqLoading() {
  return (
    <div role="status" aria-label="Cargando">
      <Skeleton className="h-[180px] rounded-[22px] sm:h-[240px]" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}
