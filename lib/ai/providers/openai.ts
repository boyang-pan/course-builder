import OpenAI from "openai";
import type { AIService, StreamTextOptions } from "@/lib/ai/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL ?? "gpt-4o";

export class OpenAIProvider implements AIService {
  async streamText(options: StreamTextOptions): Promise<ReadableStream<Uint8Array>> {
    const { prompt, systemPrompt, maxTokens = 4096 } = options;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const stream = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
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

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
