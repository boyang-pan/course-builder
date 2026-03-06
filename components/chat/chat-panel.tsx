"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { OutlineProposalCard } from "@/components/chat/outline-proposal-card";
import { useCourseStore, type WorkspaceView } from "@/lib/stores/course-store";
import { useCourseBuilder } from "@/lib/hooks/use-course-builder";
import { useContextualChat } from "@/lib/hooks/use-contextual-chat";
import { useChat } from "@/lib/hooks/use-chat";
import type { CourseQuestion } from "@/types/chat";
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
  const { messages, isAITyping, activeView } = useCourseStore();
  const { startNewCourse } = useCourseBuilder();
  const { sendUserMessage, addAssistantMessage } = useChat();
  const [outlineProposal, setOutlineProposal] = useState<OutlineProposal | null>(null);

  // Pending state for when we're waiting for question answers
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);
  const [freeTextParts, setFreeTextParts] = useState<string[]>([]);
  const pendingTopicRef = useRef(pendingTopic);
  pendingTopicRef.current = pendingTopic;

  const { sendContextualMessage, isStreaming, abort } = useContextualChat({
    onOutlineProposal: setOutlineProposal,
  });

  const abortRef = useRef(abort);
  abortRef.current = abort;

  // Clear everything when context changes
  const viewKey = getViewKey(activeView);
  const prevViewKey = useRef(viewKey);
  useEffect(() => {
    if (prevViewKey.current !== viewKey) {
      prevViewKey.current = viewKey;
      abortRef.current();
      setOutlineProposal(null);
      setPendingTopic(null);
      setFreeTextParts([]);
    }
  }, [viewKey]);

  const handleSend = async (text: string) => {
    if (activeView.type === "idle") {
      if (pendingTopicRef.current !== null) {
        // User typed extra context while question card is visible — store it
        sendUserMessage(text);
        setFreeTextParts((prev) => [...prev, text]);
      } else {
        // First message: show user bubble, fetch AI questions
        sendUserMessage(text);
        setPendingTopic(text);
        setFreeTextParts([]);

        // Placeholder while AI generates questions
        const placeholder = addAssistantMessage("", true);
        void placeholder;

        try {
          const res = await fetch("/api/ai/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: text }),
          });

          if (!res.ok) throw new Error("Failed to fetch questions");

          const questions: CourseQuestion[] = await res.json();

          // Replace streaming placeholder with question card
          useCourseStore.getState().updateMessage(placeholder.id, {
            isStreaming: false,
            type: "questions",
            questions,
          });
        } catch {
          useCourseStore.getState().updateMessage(placeholder.id, {
            isStreaming: false,
            content: "I had trouble generating personalised questions. Click below to generate your course anyway.",
          });
        }
      }
    } else {
      await sendContextualMessage(text);
    }
  };

  const handleQuestionSubmit = useCallback(
    async (answers: Record<string, string> | null) => {
      if (!pendingTopicRef.current) return;
      const topic = pendingTopicRef.current;
      const freeText = freeTextParts.join(" ").trim();
      setPendingTopic(null);
      setFreeTextParts([]);

      const learnerContext: Record<string, string> = { ...(answers ?? {}) };
      if (freeText) learnerContext.freeText = freeText;

      await startNewCourse(topic, Object.keys(learnerContext).length > 0 ? learnerContext : undefined);
    },
    [freeTextParts, startNewCourse]
  );

  const isDisabled = isAITyping || isStreaming;
  const { title, subtitle } = getContextLabel(activeView);

  const placeholder =
    activeView.type === "idle"
      ? pendingTopic !== null
        ? "Add more context, or answer the questions above..."
        : "e.g. Teach me Rust programming from scratch..."
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
      <MessageList
        messages={messages}
        isAITyping={isAITyping}
        onQuestionSubmit={handleQuestionSubmit}
      />
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
