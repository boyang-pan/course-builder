"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QuestionCard } from "@/components/chat/question-card";

interface MessageBubbleProps {
  message: Message;
  onQuestionSubmit?: (answers: Record<string, string> | null) => void;
}

export function MessageBubble({ message, onQuestionSubmit }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (message.type === "questions" && message.questions) {
    return (
      <div className="flex justify-start">
        <QuestionCard
          questions={message.questions}
          onSubmit={onQuestionSubmit ?? (() => {})}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-foreground text-background rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className={cn("prose-sm", message.isStreaming && message.content === "" && "streaming-cursor")}>
            {message.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : (
              <span className="streaming-cursor" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
