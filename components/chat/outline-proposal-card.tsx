"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OutlineProposal } from "@/lib/utils/parse-outline-proposal";

interface Props {
  proposal: OutlineProposal;
  courseId: string;
  onApply: () => void;
  onDismiss: () => void;
}

export function OutlineProposalCard({ proposal, courseId, onApply, onDismiss }: Props) {
  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setIsApplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/outline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapters: proposal.chapters }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      onApply();
    } catch {
      setError("Failed to apply changes. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="px-3 pb-3">
      <Card className="border-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Proposed Outline
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 space-y-1">
          {proposal.chapters.map((ch) => (
            <p key={ch.order} className="text-xs">
              <span className="font-medium">
                {ch.order}. {ch.title}
              </span>
              <span className="text-muted-foreground"> — {ch.summary}</span>
            </p>
          ))}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="px-3 pb-3 gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss} disabled={isApplying}>
            Dismiss
          </Button>
          <Button size="sm" onClick={handleApply} disabled={isApplying}>
            {isApplying ? "Applying..." : "Apply Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
