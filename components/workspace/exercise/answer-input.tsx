"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface AnswerInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function AnswerInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled = false,
}: AnswerInputProps) {
  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here... (be thorough and specific)"
        className="min-h-[120px] resize-none text-sm"
        disabled={disabled || isSubmitting}
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || isSubmitting || value.trim().length < 10}
        className="gap-2"
        size="sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Grading...
          </>
        ) : (
          <>
            <Send className="size-3.5" />
            Submit Answer
          </>
        )}
      </Button>
    </div>
  );
}
