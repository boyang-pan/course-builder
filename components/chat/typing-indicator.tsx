"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
    </div>
  );
}
