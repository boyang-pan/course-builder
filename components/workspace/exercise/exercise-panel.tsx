"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnswerInput } from "@/components/workspace/exercise/answer-input";
import { GradeResultCard } from "@/components/workspace/exercise/grade-result";
import { useCourseStore } from "@/lib/stores/course-store";
import { useExercise } from "@/lib/hooks/use-exercise";
import type { Exercise, Chapter, GradeResult } from "@/types/course";
import { ArrowRight, ChevronRight } from "lucide-react";

interface ExercisePanelProps {
  exercise: Exercise;
  chapter: Chapter;
  courseId: string;
  exerciseOrder: number;
  onNextChapter?: () => void;
}

export function ExercisePanel({
  exercise,
  chapter,
  courseId,
  exerciseOrder,
  onNextChapter,
}: ExercisePanelProps) {
  const [answer, setAnswer] = useState("");
  const [localGradeResult, setLocalGradeResult] = useState<GradeResult | null>(null);
  const { setActiveView } = useCourseStore();
  const { isGrading, submitAnswer } = useExercise(courseId);

  const totalExercises = chapter.exercises?.length ?? 0;
  const progress = ((exerciseOrder - 1) / totalExercises) * 100;

  const isPassed = localGradeResult?.grade === "PASS";
  const isLastExercise = exerciseOrder === totalExercises;

  const allPassed =
    isPassed &&
    isLastExercise &&
    chapter.exercises?.every((e) =>
      e.order < exerciseOrder ? e.passed : e.id === exercise.id
    );

  const handleSubmit = async () => {
    const result = await submitAnswer(
      chapter.id,
      exercise.id,
      answer,
      exerciseOrder,
      totalExercises,
      chapter.order
    );
    if (result) setLocalGradeResult(result);
  };

  const handleNextExercise = () => {
    const nextExercise = chapter.exercises
      ?.sort((a, b) => a.order - b.order)
      .find((e) => e.order === exerciseOrder + 1);

    if (nextExercise) {
      setLocalGradeResult(null);
      setAnswer("");
      setActiveView({
        type: "exercise",
        courseId,
        chapterId: chapter.id,
        exerciseId: nextExercise.id,
        exerciseOrder: exerciseOrder + 1,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Chapter {chapter.order}
            </Badge>
            <ChevronRight className="size-3 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              Exercise {exerciseOrder} / {totalExercises}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Question {exerciseOrder}
          </p>
          <p className="text-sm font-medium leading-relaxed">{exercise.question}</p>
        </div>

        {!isPassed ? (
          <AnswerInput
            value={answer}
            onChange={setAnswer}
            onSubmit={handleSubmit}
            isSubmitting={isGrading}
          />
        ) : (
          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Your answer</p>
            <p className="text-sm">{answer}</p>
          </div>
        )}

        {localGradeResult && (
          <GradeResultCard result={localGradeResult} />
        )}

        {isPassed && !isLastExercise && (
          <Button
            onClick={handleNextExercise}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 w-full"
            size="sm"
          >
            Next Exercise
            <ArrowRight className="size-3.5" />
          </Button>
        )}

        {isPassed && isLastExercise && onNextChapter && (
          <Button
            onClick={onNextChapter}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 w-full"
            size="sm"
          >
            Next Chapter
            <ArrowRight className="size-3.5" />
          </Button>
        )}

        {!isPassed && localGradeResult && (
          <p className="text-xs text-muted-foreground text-center">
            Review the feedback above and revise your answer. You can retry as many times as needed.
          </p>
        )}
      </div>
    </div>
  );
}
