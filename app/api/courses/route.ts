import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { outlinePrompt } from "@/lib/ai/prompts";
import { OutlineResponseSchema } from "@/lib/ai/schemas";
import { createCourse, getCoursesByUser } from "@/lib/db/queries/courses";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const courses = await getCoursesByUser(userId);
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { topic } = await req.json();
  if (!topic || typeof topic !== "string") {
    return new NextResponse("Missing topic", { status: 400 });
  }

  const ai = getAIService();
  const { system, user } = outlinePrompt(topic);

  const raw = await ai.generateText({
    prompt: user,
    systemPrompt: system,
    maxTokens: 1024,
  });

  let parsed;
  try {
    parsed = OutlineResponseSchema.parse(JSON.parse(raw));
  } catch {
    return new NextResponse("Invalid AI response", { status: 500 });
  }

  const course = await createCourse({
    userId,
    title: parsed.title,
    description: parsed.description,
    topic,
    outline: parsed.chapters,
  });

  return NextResponse.json(course);
}
