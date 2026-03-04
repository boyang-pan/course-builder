"use client";

import { use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChatPanel } from "@/components/chat/chat-panel";
import { WorkspacePanel } from "@/components/workspace/workspace-panel";
import { useCourseStore } from "@/lib/stores/course-store";

function CoursePageInner({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const { setActiveView, setActiveCourseId, activeView } = useCourseStore();

  useEffect(() => {
    setActiveCourseId(courseId);

    const chapterId = searchParams.get("chapter");
    const exerciseId = searchParams.get("exercise");
    const chapterOrder = searchParams.get("chapterOrder");
    const exerciseOrder = searchParams.get("exerciseOrder");

    if (chapterId && exerciseId && exerciseOrder) {
      setActiveView({
        type: "exercise",
        courseId,
        chapterId,
        exerciseId,
        exerciseOrder: Number(exerciseOrder),
      });
    } else if (chapterId && chapterOrder) {
      setActiveView({
        type: "chapter",
        courseId,
        chapterId,
        chapterOrder: Number(chapterOrder),
      });
    } else if (activeView.type === "idle") {
      setActiveView({ type: "outline", courseId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full"
    >
      <ResizablePanel defaultSize="35%" minSize="25%" maxSize="50%">
        <ChatPanel />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="65%" minSize="40%">
        <WorkspacePanel initialCourseId={courseId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default function CourseIdPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  return <CoursePageInner courseId={courseId} />;
}
