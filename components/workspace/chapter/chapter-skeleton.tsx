import { Skeleton } from "@/components/ui/skeleton";

export function ChapterSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-6 w-1/3 mt-6" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg mt-2" />
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
