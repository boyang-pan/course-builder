import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { questionsPrompt } from "@/lib/ai/prompts";
import { CourseQuestionsSchema } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { topic } = await req.json();
  if (!topic || typeof topic !== "string") {
    return new NextResponse("Missing topic", { status: 400 });
  }

  const ai = getAIService();
  const { system, user } = questionsPrompt(topic);

  const raw = await ai.generateText({
    prompt: user,
    systemPrompt: system,
    maxTokens: 512,
  });

  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const questions = CourseQuestionsSchema.parse(JSON.parse(cleaned));
    return NextResponse.json(questions);
  } catch {
    console.error("Invalid AI questions response:", raw);
    return new NextResponse("Invalid AI response", { status: 500 });
  }
}
