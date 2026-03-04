import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { chapterPrompt } from "@/lib/ai/prompts";
import { ExercisesArraySchema } from "@/lib/ai/schemas";
import { CHAPTER_EXERCISES_DELIMITER } from "@/lib/constants";
import { getCourseById } from "@/lib/db/queries/courses";
import {
  createChapter,
  getChapterByCourseAndOrder,
  updateChapterContent,
} from "@/lib/db/queries/chapters";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { courseId } = await params;
  const { order } = await req.json();

  if (typeof order !== "number" || order < 1) {
    return new NextResponse("Invalid chapter order", { status: 400 });
  }

  const course = await getCourseById(courseId, userId);
  if (!course) return new NextResponse("Course not found", { status: 404 });

  // Check if chapter already exists
  const existing = await getChapterByCourseAndOrder(courseId, order);
  if (existing?.content) {
    return new NextResponse("Chapter already generated", { status: 409 });
  }

  const outline = course.outline as Array<{
    order: number;
    title: string;
    summary: string;
  }>;
  const chapterOutline = outline.find((c) => c.order === order);
  if (!chapterOutline) {
    return new NextResponse("Chapter not in outline", { status: 404 });
  }

  const previousChapters = outline
    .filter((c) => c.order < order)
    .map((c) => ({ title: c.title, summary: c.summary }));

  // Create chapter row
  let chapter = existing;
  if (!chapter) {
    chapter = await createChapter({
      courseId,
      order,
      title: chapterOutline.title,
      summary: chapterOutline.summary,
    });
  }

  const chapterId = chapter.id;

  const ai = getAIService();
  const { system, user } = chapterPrompt(
    course.title,
    chapterOutline.title,
    chapterOutline.summary,
    order,
    previousChapters
  );

  const aiStream = await ai.streamText({
    prompt: user,
    systemPrompt: system,
    maxTokens: 4096,
  });

  const encoder = new TextEncoder();
  let fullContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = aiStream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        controller.enqueue(encoder.encode(chunk));
      }

      // Parse exercises from content
      const delimIdx = fullContent.indexOf(CHAPTER_EXERCISES_DELIMITER);
      let content = fullContent;
      let exercises: Array<{ order: number; question: string; rubric: string }> = [];

      if (delimIdx !== -1) {
        content = fullContent.slice(0, delimIdx).trim();
        const exercisesRaw = fullContent.slice(
          delimIdx + CHAPTER_EXERCISES_DELIMITER.length
        ).trim();
        try {
          exercises = ExercisesArraySchema.parse(JSON.parse(exercisesRaw));
        } catch {
          // Exercises parse failed — save content without exercises
        }
      }

      // Save to DB
      await updateChapterContent(chapterId, content, exercises);

      // Send done signal with chapterId
      controller.enqueue(encoder.encode(`\n__DONE__:${chapterId}`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
