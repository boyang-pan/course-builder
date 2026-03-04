"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCourseStore } from "@/lib/stores/course-store";
import { useChat } from "@/lib/hooks/use-chat";
import { useStream } from "@/lib/hooks/use-stream";
import type { Course } from "@/types/course";

export function useCourseBuilder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    setActiveView,
    setActiveCourseId,
    clearStreamingContent,
    appendStreamingContent,
    streamingContent,
  } = useCourseStore();
  const { sendUserMessage, addAssistantMessage, setIsAITyping } = useChat();

  const { isStreaming: isGeneratingOutline, startStream: startOutlineStream } =
    useStream();

  const generateCourse = useCallback(
    async (topic: string) => {
      sendUserMessage(topic);
      setIsAITyping(true);
      clearStreamingContent();

      // Placeholder assistant message while streaming
      const assistantMsg = addAssistantMessage("", true);
      void assistantMsg;

      let fullText = "";

      await startOutlineStream(
        "/api/ai/outline",
        { topic },
      );

      // After stream, the outline is returned via SSE — handled in the route
      // The route returns JSON with { courseId, outline }
      // We need to handle this differently — use a regular fetch POST
      setIsAITyping(false);
    },
    [
      sendUserMessage,
      addAssistantMessage,
      setIsAITyping,
      clearStreamingContent,
      startOutlineStream,
    ]
  );

  const startNewCourse = useCallback(
    async (topic: string) => {
      sendUserMessage(topic);
      setIsAITyping(true);

      try {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });

        if (!res.ok) throw new Error("Failed to create course");

        const course: Course = await res.json();
        setActiveCourseId(course.id);
        setActiveView({ type: "outline", courseId: course.id });

        addAssistantMessage(
          `I've created your course outline for **"${course.title}"**. Click any chapter to start learning!`
        );

        await queryClient.invalidateQueries({ queryKey: ["courses"] });
        router.push(`/course/${course.id}`);
      } catch {
        addAssistantMessage(
          "Sorry, I encountered an error creating your course. Please try again."
        );
      } finally {
        setIsAITyping(false);
      }
    },
    [
      sendUserMessage,
      addAssistantMessage,
      setIsAITyping,
      setActiveCourseId,
      setActiveView,
      queryClient,
      router,
    ]
  );

  return {
    isGeneratingOutline,
    streamingContent,
    startNewCourse,
    generateCourse,
  };
}
