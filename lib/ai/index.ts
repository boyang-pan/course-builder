import type { AIService } from "@/lib/ai/types";

let instance: AIService | null = null;

export function getAIService(): AIService {
  if (instance) return instance;

  const provider = process.env.AI_PROVIDER ?? "anthropic";

  if (provider === "openai") {
    const { OpenAIProvider } = require("@/lib/ai/providers/openai");
    instance = new OpenAIProvider();
  } else {
    const { AnthropicProvider } = require("@/lib/ai/providers/anthropic");
    instance = new AnthropicProvider();
  }

  return instance!;
}
