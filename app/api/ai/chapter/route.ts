import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { chapterPrompt } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { courseTitle, chapterTitle, chapterSummary, chapterOrder, previousChapters } =
    await req.json();

  const ai = getAIService();
  const { system, user } = chapterPrompt(
    courseTitle,
    chapterTitle,
    chapterSummary,
    chapterOrder,
    previousChapters ?? []
  );

  const stream = await ai.streamText({
    prompt: user,
    systemPrompt: system,
    maxTokens: 4096,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
