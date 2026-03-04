export interface StreamTextOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

export interface AIService {
  streamText(options: StreamTextOptions): Promise<ReadableStream<Uint8Array>>;
  generateText(options: StreamTextOptions): Promise<string>;
}

export interface OutlineResult {
  title: string;
  description: string;
  chapters: Array<{
    order: number;
    title: string;
    summary: string;
  }>;
}

export interface ChapterContentResult {
  content: string;
  exercises: Array<{
    order: number;
    question: string;
    rubric: string;
  }>;
}

export interface GradeResult {
  grade: "PASS" | "FAIL";
  feedback: string;
}
