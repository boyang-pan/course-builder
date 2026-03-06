"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CourseQuestion } from "@/types/chat";

interface QuestionCardProps {
  questions: CourseQuestion[];
  onSubmit: (answers: Record<string, string> | null) => void;
}

export function QuestionCard({ questions, onSubmit }: QuestionCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const toggle = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm space-y-4 max-w-[85%]">
      <p className="font-medium text-foreground text-xs uppercase tracking-wide text-muted-foreground">
        Quick questions to personalise your course
      </p>
      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <p className="font-medium text-foreground">{q.text}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(q.id, opt.value)}
                  className={cn(
                    "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
                    selected
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <Button
          size="sm"
          disabled={!allAnswered}
          onClick={() => onSubmit(answers)}
        >
          Generate Course ▶
        </Button>
        <button
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          onClick={() => onSubmit(null)}
        >
          Skip &amp; generate now →
        </button>
      </div>
    </div>
  );
}
