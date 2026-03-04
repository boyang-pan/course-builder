import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { outlinePrompt } from "@/lib/ai/prompts";
import { OutlineResponseSchema } from "@/lib/ai/schemas";
import { createCourse, getCoursesByUser } from "@/lib/db/queries/courses";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const courses = await getCoursesByUser(userId);
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Ensure user record exists (webhook may not be configured in local dev)
  const clerkUser = await currentUser();
  if (clerkUser) {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
      },
    });
  }

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
    // Strip markdown code fences if the model wraps the JSON
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    parsed = OutlineResponseSchema.parse(JSON.parse(cleaned));
  } catch {
    console.error("Invalid AI response:", raw);
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
