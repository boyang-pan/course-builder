"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChapterContent } from "@/components/workspace/chapter/chapter-content";
import { ChapterSkeleton } from "@/components/workspace/chapter/chapter-skeleton";
import { useCourseStore } from "@/lib/stores/course-store";
import { useExercise } from "@/lib/hooks/use-exercise";
import type { Chapter } from "@/types/course";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";

interface ChapterViewerProps {
  chapter: Chapter;
  courseId: string;
  chapterOrder: number;
  isGenerating?: boolean;
}

export function ChapterViewer({
  chapter,
  courseId,
  chapterOrder,
  isGenerating = false,
}: ChapterViewerProps) {
  const { streamingContent, setActiveView } = useCourseStore();
  const { startExercises } = useExercise(courseId);

  const displayContent = isGenerating
    ? streamingContent.split("<<<EXERCISES>>>")[0]
    : chapter.content?.split("<<<EXERCISES>>>")[0] ?? "";

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground"
            onClick={() => setActiveView({ type: "outline", courseId })}
          >
            <ArrowLeft className="size-3" />
            Outline
          </Button>
          <Badge variant="secondary" className="text-xs">
            Chapter {chapterOrder}
          </Badge>
          <h2 className="text-base font-semibold">{chapter.title}</h2>
        </div>
        {chapter.exercises && chapter.exercises.length > 0 && !isGenerating && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const sorted = chapter.exercises!.sort((a, b) => a.order - b.order);
              const firstUnanswered = sorted.find((e) => !e.passed) ?? sorted[0];
              startExercises(chapter.id, firstUnanswered.id, chapterOrder, firstUnanswered.order);
            }}
          >
            <BookOpen className="size-3.5" />
            Start Exercises
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </div>
      {isGenerating && !streamingContent ? (
        <ChapterSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ChapterContent
            content={displayContent}
            isStreaming={isGenerating}
          />
          {!isGenerating && (!chapter.exercises || chapter.exercises.length === 0) && (
            <p className="text-xs text-muted-foreground mt-6 text-center">
              No exercises for this chapter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
