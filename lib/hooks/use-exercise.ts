"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCourseStore } from "@/lib/stores/course-store";
import { useChat } from "@/lib/hooks/use-chat";
import type { GradeResult } from "@/types/course";

export function useExercise(courseId: string) {
  const queryClient = useQueryClient();
  const { setLastGradeResult, setActiveView } = useCourseStore();
  const { addAssistantMessage } = useChat();
  const [isGrading, setIsGrading] = useState(false);

  const submitAnswer = useCallback(
    async (
      chapterId: string,
      exerciseId: string,
      answer: string,
      exerciseOrder: number,
      totalExercises: number,
      chapterOrder: number
    ): Promise<GradeResult | null> => {
      setIsGrading(true);
      setLastGradeResult(null);

      try {
        const res = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/exercises/${exerciseId}/submissions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer }),
          }
        );

        if (!res.ok) throw new Error("Failed to grade submission");

        const result: GradeResult = await res.json();
        setLastGradeResult(result);

        await queryClient.invalidateQueries({ queryKey: ["course", courseId] });

        if (result.grade === "PASS") {
          const isLastExercise = exerciseOrder === totalExercises;
          if (isLastExercise) {
            addAssistantMessage(
              `Excellent work! You've completed all exercises for Chapter ${chapterOrder}. Click "Next Chapter →" to continue your learning journey!`
            );
          } else {
            addAssistantMessage(
              `Great answer! Moving to exercise ${exerciseOrder + 1} of ${totalExercises}.`
            );
          }
        }

        return result;
      } catch {
        addAssistantMessage(
          "Sorry, there was an error grading your answer. Please try again."
        );
        return null;
      } finally {
        setIsGrading(false);
      }
    },
    [courseId, queryClient, setLastGradeResult, addAssistantMessage]
  );

  const startExercises = useCallback(
    (chapterId: string, firstExerciseId: string, chapterOrder: number, exerciseOrder = 1) => {
      setActiveView({
        type: "exercise",
        courseId,
        chapterId,
        exerciseId: firstExerciseId,
        exerciseOrder,
      });
      addAssistantMessage(
        `Let's test your understanding of Chapter ${chapterOrder}. Answer each question thoughtfully — you can retry as many times as needed!`
      );
    },
    [courseId, setActiveView, addAssistantMessage]
  );

  return { isGrading, submitAnswer, startExercises };
}
