"use client";

import { QueryProvider } from "@/components/layout/query-provider";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChatPanel } from "@/components/chat/chat-panel";
import { WorkspacePanel } from "@/components/workspace/workspace-panel";

export default function NewCoursePage() {
  return (
    <QueryProvider>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full"
      >
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <ChatPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={40}>
          <WorkspacePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </QueryProvider>
  );
}
