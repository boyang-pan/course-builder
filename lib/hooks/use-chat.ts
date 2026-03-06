"use client";

import { useCallback } from "react";
import { useCourseStore } from "@/lib/stores/course-store";
import type { Message } from "@/types/chat";
import { generateId } from "@/lib/utils";

export function useChat() {
  const {
    messages,
    isAITyping,
    addMessage,
    setIsAITyping,
    clearMessages,
  } = useCourseStore();

  const sendUserMessage = useCallback(
    (content: string) => {
      const message: Message = {
        id: generateId(),
        role: "user",
        content,
        createdAt: new Date(),
      };
      addMessage(message);
      return message;
    },
    [addMessage]
  );

  const addAssistantMessage = useCallback(
    (content: string, isStreaming = false, extra?: Partial<Omit<Message, "id" | "role" | "content" | "createdAt" | "isStreaming">>): Message => {
      const message: Message = {
        id: generateId(),
        role: "assistant",
        content,
        createdAt: new Date(),
        isStreaming,
        ...extra,
      };
      addMessage(message);
      return message;
    },
    [addMessage]
  );

  return {
    messages,
    isAITyping,
    sendUserMessage,
    addAssistantMessage,
    setIsAITyping,
    clearMessages,
  };
}
