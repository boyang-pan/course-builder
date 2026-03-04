"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCourseStore } from "@/lib/stores/course-store";
import { useChat } from "@/lib/hooks/use-chat";

export function useChapter(courseId: string) {
  const queryClient = useQueryClient();
  const { setActiveView, appendStreamingContent, clearStreamingContent } =
    useCourseStore();
  const { addAssistantMessage } = useChat();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateChapter = useCallback(
    async (chapterOrder: number, chapterTitle: string) => {
      setIsGenerating(true);
      clearStreamingContent();

      try {
        const res = await fetch(`/api/courses/${courseId}/chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: chapterOrder }),
        });

        if (!res.ok) throw new Error("Failed to generate chapter");
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let chapterId = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Check for the SSE done event with chapterId
          if (chunk.includes("__DONE__:")) {
            const match = chunk.match(/__DONE__:(\S+)/);
            if (match) chapterId = match[1];
            break;
          }

          buffer += chunk;
          appendStreamingContent(chunk);
        }

        // Refresh course data
        await queryClient.invalidateQueries({ queryKey: ["course", courseId] });

        if (chapterId) {
          setActiveView({ type: "chapter", courseId, chapterId, chapterOrder });
          addAssistantMessage(
            `Chapter ${chapterOrder}: **"${chapterTitle}"** is ready! Read through the content, then complete the exercises to unlock the next chapter.`
          );
        }
      } catch {
        addAssistantMessage(
          "Sorry, I had trouble generating that chapter. Please try again."
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [
      courseId,
      queryClient,
      setActiveView,
      appendStreamingContent,
      clearStreamingContent,
      addAssistantMessage,
    ]
  );

  return { isGenerating, generateChapter };
}
