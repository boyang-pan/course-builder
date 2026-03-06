"use client";

import { useEffect, useRef, useState } from "react";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { OutlineProposalCard } from "@/components/chat/outline-proposal-card";
import { useCourseStore, type WorkspaceView } from "@/lib/stores/course-store";
import { useCourseBuilder } from "@/lib/hooks/use-course-builder";
import { useContextualChat } from "@/lib/hooks/use-contextual-chat";
import type { OutlineProposal } from "@/lib/utils/parse-outline-proposal";

function getContextLabel(activeView: WorkspaceView): { title: string; subtitle: string } {
  switch (activeView.type) {
    case "idle":
      return { title: "Course Builder", subtitle: "AI-powered adaptive learning" };
    case "outline":
      return { title: "Course Outline", subtitle: "Ask about the outline or request changes..." };
    case "chapter":
      return {
        title: `Chapter ${activeView.chapterOrder}`,
        subtitle: "Ask about this chapter...",
      };
    case "exercise":
      return {
        title: `Exercise ${activeView.exerciseOrder}`,
        subtitle: "Need a hint? Ask here...",
      };
  }
}

function getViewKey(activeView: WorkspaceView): string {
  switch (activeView.type) {
    case "idle":
      return "idle";
    case "outline":
      return `outline:${activeView.courseId}`;
    case "chapter":
      return `chapter:${activeView.courseId}:${activeView.chapterId}`;
    case "exercise":
      return `exercise:${activeView.courseId}:${activeView.chapterId}:${activeView.exerciseId}`;
  }
}

export function ChatPanel() {
  const { messages, isAITyping, activeView, clearMessages } = useCourseStore();
  const { startNewCourse } = useCourseBuilder();
  const [outlineProposal, setOutlineProposal] = useState<OutlineProposal | null>(null);

  const { sendContextualMessage, isStreaming, abort } = useContextualChat({
    onOutlineProposal: setOutlineProposal,
  });

  const abortRef = useRef(abort);
  abortRef.current = abort;

  // Clear messages and proposal when context changes
  const viewKey = getViewKey(activeView);
  const prevViewKey = useRef(viewKey);
  useEffect(() => {
    if (prevViewKey.current !== viewKey) {
      prevViewKey.current = viewKey;
      abortRef.current();
      clearMessages();
      setOutlineProposal(null);
    }
  }, [viewKey, clearMessages]);

  const handleSend = async (text: string) => {
    if (activeView.type === "idle") {
      await startNewCourse(text);
    } else {
      await sendContextualMessage(text);
    }
  };

  const isDisabled = isAITyping || isStreaming;
  const { title, subtitle } = getContextLabel(activeView);

  const placeholder =
    activeView.type === "idle"
      ? "e.g. Teach me Rust programming from scratch..."
      : activeView.type === "outline"
      ? "Ask about the outline or request changes..."
      : activeView.type === "chapter"
      ? "Ask about this chapter..."
      : "Need a hint? Ask here...";

  const courseId =
    activeView.type !== "idle" ? activeView.courseId : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <MessageList messages={messages} isAITyping={isAITyping} />
      {outlineProposal && courseId && (
        <OutlineProposalCard
          proposal={outlineProposal}
          courseId={courseId}
          onApply={() => setOutlineProposal(null)}
          onDismiss={() => setOutlineProposal(null)}
        />
      )}
      <ChatInput onSend={handleSend} disabled={isDisabled} placeholder={placeholder} />
    </div>
  );
}
