"use client";

import { useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCourseStore } from "@/lib/stores/course-store";
import { useChat } from "@/lib/hooks/use-chat";
import { useStream } from "@/lib/hooks/use-stream";
import {
  parseOutlineProposal,
  stripOutlineProposalTag,
  type OutlineProposal,
} from "@/lib/utils/parse-outline-proposal";
import type { Course } from "@/types/course";

const MAX_HISTORY = 10;

export function useContextualChat(
  opts: { onOutlineProposal?: (p: OutlineProposal) => void } = {}
) {
  const queryClient = useQueryClient();
  const { activeView, updateLastMessage, setIsAITyping } = useCourseStore();
  const { sendUserMessage, addAssistantMessage } = useChat();
  const accRef = useRef("");

  const { isStreaming, startStream, abort } = useStream({
    onChunk: (chunk) => {
      accRef.current += chunk;
      // Hide partial <outline_proposal> tag during streaming
      const display = accRef.current.replace(/<outline_proposal>[\s\S]*$/, "").trim();
      updateLastMessage(display || accRef.current);
    },
    onDone: (fullText) => {
      const proposal = parseOutlineProposal(fullText);
      updateLastMessage(proposal ? stripOutlineProposalTag(fullText) : fullText);
      setIsAITyping(false);
      if (proposal) opts.onOutlineProposal?.(proposal);
    },
    onError: () => {
      updateLastMessage("Sorry, something went wrong. Please try again.");
      setIsAITyping(false);
    },
  });

  const sendContextualMessage = useCallback(
    async (text: string) => {
      if (activeView.type === "idle") return;

      const courseId = activeView.courseId;
      const course = queryClient.getQueryData<Course>(["course", courseId]);

      if (!course) {
        addAssistantMessage("Course data is still loading — please try again in a moment.");
        return;
      }

      sendUserMessage(text);
      addAssistantMessage("", true);
      setIsAITyping(true);
      accRef.current = "";

      let context: Record<string, unknown>;

      if (activeView.type === "outline") {
        context = {
          type: "outline",
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            outline: course.outline,
          },
        };
      } else if (activeView.type === "chapter") {
        const chapter = course.chapters?.find((c) => c.id === activeView.chapterId);
        if (!chapter?.content) {
          updateLastMessage("Chapter is still generating. Try again shortly.");
          setIsAITyping(false);
          return;
        }
        context = {
          type: "chapter",
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            outline: course.outline,
          },
          chapter: {
            title: chapter.title,
            summary: chapter.summary,
            content: chapter.content,
          },
        };
      } else if (activeView.type === "exercise") {
        const chapter = course.chapters?.find((c) => c.id === activeView.chapterId);
        const exercise = chapter?.exercises?.find((e) => e.id === activeView.exerciseId);
        if (!chapter?.content || !exercise) {
          updateLastMessage("Exercise not found. Please refresh.");
          setIsAITyping(false);
          return;
        }
        context = {
          type: "exercise",
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            outline: course.outline,
          },
          chapter: {
            title: chapter.title,
            summary: chapter.summary,
            content: chapter.content,
          },
          exercise: {
            question: exercise.question,
            order: activeView.exerciseOrder,
          },
        };
      } else {
        return;
      }

      // Last MAX_HISTORY messages from store, excluding the empty streaming placeholder
      const storeMessages = useCourseStore.getState().messages;
      const chatMessages = storeMessages
        .slice(0, -1) // exclude empty placeholder
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }));

      await startStream("/api/chat", { messages: chatMessages, context });
    },
    [
      activeView,
      queryClient,
      sendUserMessage,
      addAssistantMessage,
      setIsAITyping,
      startStream,
      updateLastMessage,
    ]
  );

  return { sendContextualMessage, isStreaming, abort };
}
