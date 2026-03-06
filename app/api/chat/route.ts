import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { outlineChatPrompt, chapterChatPrompt, exerciseChatPrompt } from "@/lib/ai/prompts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OutlineCourse {
  id: string;
  title: string;
  description: string;
  outline: Array<{ order: number; title: string; summary: string }>;
}

interface ChatContext {
  type: "outline" | "chapter" | "exercise";
  course: OutlineCourse;
  chapter?: { title: string; summary: string; content: string };
  exercise?: { question: string; order: number };
}

function buildPrompt(messages: ChatMessage[]): string {
  if (messages.length === 1) {
    return `Learner: ${messages[0].content}`;
  }

  const history = messages.slice(0, -1);
  const last = messages[messages.length - 1];
  const transcript = history
    .map((m) => `${m.role === "user" ? "Learner" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `Previous conversation:\n${transcript}\n---\nNow respond to:\nLearner: ${last.content}`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { messages, context }: { messages: ChatMessage[]; context: ChatContext } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new NextResponse("Bad Request: messages required", { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return new NextResponse("Bad Request: last message must be from user", { status: 400 });
  }

  if (!context || !context.type || !context.course) {
    return new NextResponse("Bad Request: context required", { status: 400 });
  }

  let system: string;
  if (context.type === "outline") {
    ({ system } = outlineChatPrompt(context.course));
  } else if (context.type === "chapter") {
    if (!context.chapter) return new NextResponse("Bad Request: chapter required", { status: 400 });
    ({ system } = chapterChatPrompt(context.course.title, context.chapter));
  } else if (context.type === "exercise") {
    if (!context.chapter || !context.exercise)
      return new NextResponse("Bad Request: chapter and exercise required", { status: 400 });
    ({ system } = exerciseChatPrompt(context.course.title, context.chapter, context.exercise));
  } else {
    return new NextResponse("Bad Request: invalid context type", { status: 400 });
  }

  const prompt = buildPrompt(messages);

  const ai = getAIService();
  const stream = await ai.streamText({ prompt, systemPrompt: system, maxTokens: 1024 });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
