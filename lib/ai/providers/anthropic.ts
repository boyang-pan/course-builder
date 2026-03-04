import Anthropic from "@anthropic-ai/sdk";
import type { AIService, StreamTextOptions } from "@/lib/ai/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-6";

export class AnthropicProvider implements AIService {
  async streamText(options: StreamTextOptions): Promise<ReadableStream<Uint8Array>> {
    const { prompt, systemPrompt, maxTokens = 4096 } = options;

    const stream = await client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  async generateText(options: StreamTextOptions): Promise<string> {
    const { prompt, systemPrompt, maxTokens = 1024 } = options;

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type");
    return block.text;
  }
}
