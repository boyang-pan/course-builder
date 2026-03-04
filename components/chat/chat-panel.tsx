"use client";

import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useCourseStore } from "@/lib/stores/course-store";
import { useCourseBuilder } from "@/lib/hooks/use-course-builder";

export function ChatPanel() {
  const { messages, isAITyping } = useCourseStore();
  const { startNewCourse } = useCourseBuilder();

  const handleSend = async (text: string) => {
    await startNewCourse(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Course Builder</h2>
        <p className="text-xs text-muted-foreground">
          AI-powered adaptive learning
        </p>
      </div>
      <MessageList messages={messages} isAITyping={isAITyping} />
      <ChatInput
        onSend={handleSend}
        disabled={isAITyping}
        placeholder="e.g. Teach me Rust programming from scratch..."
      />
    </div>
  );
}
