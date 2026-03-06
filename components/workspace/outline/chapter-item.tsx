"use client";

import { cn } from "@/lib/utils";
import type { ChapterOutlineItem } from "@/types/course";
import type { ChapterStatus } from "@/types/course";
import { Lock, CheckCircle2, Circle, Loader2, BookOpen } from "lucide-react";

interface ChapterItemProps {
  item: ChapterOutlineItem;
  status: ChapterStatus;
  isActive?: boolean;
  onClick: () => void;
}

const statusConfig: Record<
  ChapterStatus,
  { icon: React.ElementType; className: string; dotClass: string }
> = {
  LOCKED: {
    icon: Lock,
    className: "text-muted-foreground cursor-not-allowed opacity-50",
    dotClass: "bg-muted-foreground",
  },
  GENERATING: {
    icon: Loader2,
    className: "text-muted-foreground cursor-wait",
    dotClass: "bg-muted-foreground",
  },
  AVAILABLE: {
    icon: BookOpen,
    className: "text-foreground cursor-pointer hover:bg-accent",
    dotClass: "bg-blue-500",
  },
  IN_PROGRESS: {
    icon: Circle,
    className: "text-foreground cursor-pointer hover:bg-accent",
    dotClass: "bg-amber-500",
  },
  COMPLETED: {
    icon: CheckCircle2,
    className: "text-foreground cursor-pointer hover:bg-accent",
    dotClass: "bg-green-500",
  },
};

export function ChapterItem({
  item,
  status,
  isActive = false,
  onClick,
}: ChapterItemProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const clickable = ["AVAILABLE", "IN_PROGRESS", "COMPLETED"].includes(status);

  return (
    <button
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left",
        isActive
          ? "border-border bg-accent"
          : "border-transparent",
        config.className
      )}
    >
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <span className="text-xs font-mono text-muted-foreground w-4">
          {item.order}
        </span>
        <div
          className={cn("size-2 rounded-full shrink-0", config.dotClass)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {item.summary}
        </p>
      </div>
      <Icon
        className={cn(
          "size-4 shrink-0 mt-0.5",
          status === "GENERATING" && "animate-spin"
        )}
      />
    </button>
  );
}
