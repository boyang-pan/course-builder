import { Skeleton } from "@/components/ui/skeleton";

export function ExerciseSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-32 w-full rounded-lg mt-4" />
      <Skeleton className="h-9 w-28" />
    </div>
  );
}
