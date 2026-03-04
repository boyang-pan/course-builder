"use client";

import { ChapterItem } from "@/components/workspace/outline/chapter-item";
import { useCourseStore } from "@/lib/stores/course-store";
import { useChapter } from "@/lib/hooks/use-chapter";
import type { Course, ChapterStatus } from "@/types/course";

interface CourseOutlineProps {
  course: Course;
}

export function CourseOutline({ course }: CourseOutlineProps) {
  const { activeView } = useCourseStore();
  const { generateChapter } = useChapter(course.id);

  const getChapterStatus = (order: number): ChapterStatus => {
    const chapter = course.chapters?.find((c) => c.order === order);
    if (!chapter) {
      // First chapter is available if no chapters generated yet
      if (order === 1) return "AVAILABLE";
      // Otherwise check if prev chapter completed
      const prevChapter = course.chapters?.find((c) => c.order === order - 1);
      if (prevChapter?.status === "COMPLETED") return "AVAILABLE";
      return "LOCKED";
    }
    return chapter.status;
  };

  const getActiveChapterId = () => {
    if (activeView.type === "chapter") return activeView.chapterId;
    if (activeView.type === "exercise") return activeView.chapterId;
    return null;
  };

  const activeChapterId = getActiveChapterId();

  const handleChapterClick = (order: number) => {
    const chapter = course.chapters?.find((c) => c.order === order);
    const outline = course.outline[order - 1];

    if (chapter?.content) {
      // Chapter already generated — navigate to it
      useCourseStore.getState().setActiveView({
        type: "chapter",
        courseId: course.id,
        chapterId: chapter.id,
        chapterOrder: order,
      });
    } else {
      // Need to generate
      generateChapter(order, outline?.title ?? `Chapter ${order}`);
    }
  };

  const outlineItems = course.outline as Array<{
    order: number;
    title: string;
    summary: string;
  }>;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4">
        <h1 className="text-xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">
            {outlineItems.length} chapters
          </span>
          {course.chapters && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {course.chapters.filter((c) => c.status === "COMPLETED").length} completed
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {outlineItems.map((item) => {
          const chapter = course.chapters?.find((c) => c.order === item.order);
          return (
            <ChapterItem
              key={item.order}
              item={item}
              status={getChapterStatus(item.order)}
              isActive={chapter?.id === activeChapterId}
              onClick={() => handleChapterClick(item.order)}
            />
          );
        })}
      </div>
    </div>
  );
}
