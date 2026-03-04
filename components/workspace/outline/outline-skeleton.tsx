import { Skeleton } from "@/components/ui/skeleton";

export function OutlineSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <Skeleton className="size-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
