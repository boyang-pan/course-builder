"use client";

import { useCallback, useRef, useState } from "react";

interface UseStreamOptions {
  onChunk?: (chunk: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export function useStream(options: UseStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const accumulatedRef = useRef("");

  const startStream = useCallback(
    async (url: string, body: unknown) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      accumulatedRef.current = "";

      setIsStreaming(true);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || `HTTP ${res.status}`);
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedRef.current += chunk;
          options.onChunk?.(chunk);
        }

        options.onDone?.(accumulatedRef.current);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          options.onError?.(error as Error);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { isStreaming, startStream, abort };
}
