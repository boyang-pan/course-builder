"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  isAITyping: boolean;
}

export function MessageList({ messages, isAITyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    if (!userScrolled) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAITyping, userScrolled]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setUserScrolled(!atBottom);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">✦</span>
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Describe what you want to learn
        </p>
        <p className="text-xs text-muted-foreground max-w-48">
          Type a topic below and I&apos;ll build a personalized course for you
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isAITyping && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-2xl rounded-bl-sm">
            <TypingIndicator />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
