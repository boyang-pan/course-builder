"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCourseStore } from "@/lib/stores/course-store";
import { useChapter } from "@/lib/hooks/use-chapter";
import { CourseOutline } from "@/components/workspace/outline/course-outline";
import { ChapterViewer } from "@/components/workspace/chapter/chapter-viewer";
import { ExercisePanel } from "@/components/workspace/exercise/exercise-panel";
import { OutlineSkeleton } from "@/components/workspace/outline/outline-skeleton";
import type { Course } from "@/types/course";
import { BookOpen } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.12 },
};

function IdleView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <BookOpen className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your workspace</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Describe a topic in the chat to generate a personalized course outline
      </p>
    </div>
  );
}

interface WorkspacePanelProps {
  initialCourseId?: string;
}

export function WorkspacePanel({ initialCourseId }: WorkspacePanelProps) {
  const { activeView, setActiveView, activeCourseId, setActiveCourseId, isAITyping } =
    useCourseStore();

  // Set initial course if provided
  useEffect(() => {
    if (initialCourseId && !activeCourseId) {
      setActiveCourseId(initialCourseId);
    }
  }, [initialCourseId, activeCourseId, setActiveCourseId]);

  const courseId =
    activeCourseId ??
    (activeView.type !== "idle" ? activeView.courseId : null);

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
    enabled: !!courseId,
    refetchInterval: activeView.type === "outline" ? 3000 : false,
  });

  const { isGenerating } = useChapter(courseId ?? "");

  const renderContent = () => {
    if (activeView.type === "idle") {
      if (isAITyping) return <OutlineSkeleton />;
      return <IdleView />;
    }

    if (!course) {
      if (isLoading) return <OutlineSkeleton />;
      return <IdleView />;
    }

    if (activeView.type === "outline") {
      return <CourseOutline course={course} />;
    }

    if (activeView.type === "chapter") {
      const chapter = course.chapters?.find(
        (c) => c.id === activeView.chapterId
      );
      if (!chapter) return <OutlineSkeleton />;

      return (
        <ChapterViewer
          chapter={chapter}
          courseId={course.id}
          chapterOrder={activeView.chapterOrder}
          isGenerating={isGenerating && !chapter.content}
        />
      );
    }

    if (activeView.type === "exercise") {
      const chapter = course.chapters?.find(
        (c) => c.id === activeView.chapterId
      );
      const exercise = chapter?.exercises?.find(
        (e) => e.id === activeView.exerciseId
      );

      if (!chapter || !exercise) return <OutlineSkeleton />;

      const outlineItems = course.outline as Array<{
        order: number;
        title: string;
        summary: string;
      }>;
      const nextChapterOutline = outlineItems.find(
        (o) => o.order === chapter.order + 1
      );

      const handleNextChapter = nextChapterOutline
        ? () => {
            setActiveView({
              type: "outline",
              courseId: course.id,
            });
          }
        : undefined;

      return (
        <ExercisePanel
          exercise={exercise}
          chapter={chapter}
          courseId={course.id}
          exerciseOrder={activeView.exerciseOrder}
          onNextChapter={handleNextChapter}
        />
      );
    }

    return <IdleView />;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView.type}
          {...fadeIn}
          className="flex flex-col h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
