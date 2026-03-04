"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ChapterContentProps {
  content: string;
  isStreaming?: boolean;
}

export function ChapterContent({ content, isStreaming = false }: ChapterContentProps) {
  return (
    <div className={cn("prose-course text-sm", isStreaming && "streaming-cursor")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
