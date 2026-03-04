"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import type { GradeResult } from "@/types/course";

interface GradeResultProps {
  result: GradeResult;
}

export function GradeResultCard({ result }: GradeResultProps) {
  const isPassed = result.grade === "PASS";

  return (
    <div
      className={cn(
        "rounded-lg border p-4 mt-4 flex items-start gap-3",
        isPassed
          ? "border-green-500/30 bg-green-500/10"
          : "border-amber-500/30 bg-amber-500/10"
      )}
    >
      {isPassed ? (
        <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
      )}
      <div>
        <p
          className={cn(
            "text-sm font-semibold mb-1",
            isPassed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
          )}
        >
          {isPassed ? "Correct!" : "Not quite yet"}
        </p>
        <p className="text-sm text-foreground">{result.feedback}</p>
      </div>
    </div>
  );
}
