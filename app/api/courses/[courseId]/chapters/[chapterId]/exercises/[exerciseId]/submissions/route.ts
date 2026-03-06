import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";
import { gradePrompt } from "@/lib/ai/prompts";
import { GradeResponseSchema } from "@/lib/ai/schemas";
import {
  createSubmission,
  getExerciseWithRubric,
  getPreviousSubmissions,
} from "@/lib/db/queries/submissions";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      chapterId: string;
      exerciseId: string;
    }>;
  }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { exerciseId } = await params;
  const { answer } = await req.json();

  if (!answer || typeof answer !== "string" || answer.trim().length < 10) {
    return new NextResponse("Answer too short", { status: 400 });
  }

  const exercise = await getExerciseWithRubric(exerciseId);
  if (!exercise) return new NextResponse("Exercise not found", { status: 404 });

  const previousAttempts = await getPreviousSubmissions(exerciseId, userId);

  const ai = getAIService();
  const { system, user } = gradePrompt(exercise.question, exercise.rubric, answer, previousAttempts);

  const raw = await ai.generateText({
    prompt: user,
    systemPrompt: system,
    maxTokens: 512,
  });

  let gradeResult;
  try {
    gradeResult = GradeResponseSchema.parse(JSON.parse(raw));
  } catch {
    return new NextResponse("Invalid AI grading response", { status: 500 });
  }

  const submission = await createSubmission({
    exerciseId,
    userId,
    answer: answer.trim(),
    grade: gradeResult.grade,
    feedback: gradeResult.feedback,
  });

  return NextResponse.json({
    grade: submission.grade,
    feedback: submission.feedback,
    submissionId: submission.id,
  });
}
