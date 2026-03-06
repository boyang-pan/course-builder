"use client";

import { useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChatPanel } from "@/components/chat/chat-panel";
import { WorkspacePanel } from "@/components/workspace/workspace-panel";
import { useCourseStore } from "@/lib/stores/course-store";

export default function NewCoursePage() {
  const { setActiveView, setActiveCourseId, clearMessages } = useCourseStore();

  useEffect(() => {
    setActiveView({ type: "idle" });
    setActiveCourseId(null);
    clearMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize="35%" minSize="25%" maxSize="50%">
        <ChatPanel />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="65%" minSize="40%">
        <WorkspacePanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
