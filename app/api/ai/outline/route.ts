import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { outlinePrompt } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { topic } = await req.json();
  if (!topic) return new NextResponse("Missing topic", { status: 400 });

  const ai = getAIService();
  const { system, user } = outlinePrompt(topic);

  const stream = await ai.streamText({
    prompt: user,
    systemPrompt: system,
    maxTokens: 1024,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
