export interface StreamTextOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

export interface AIService {
  streamText(options: StreamTextOptions): Promise<ReadableStream<Uint8Array>>;
  generateText(options: StreamTextOptions): Promise<string>;
}
