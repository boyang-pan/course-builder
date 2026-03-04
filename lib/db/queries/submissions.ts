import { prisma } from "@/lib/db/client";

export async function createSubmission(data: {
  exerciseId: string;
  userId: string;
  answer: string;
  grade: "PASS" | "FAIL";
  feedback: string;
}) {
  const maxAttempt = await prisma.submission.aggregate({
    where: { exerciseId: data.exerciseId },
    _max: { attemptNumber: true },
  });

  const attemptNumber = (maxAttempt._max.attemptNumber ?? 0) + 1;

  const submission = await prisma.submission.create({
    data: {
      exerciseId: data.exerciseId,
      userId: data.userId,
      answer: data.answer,
      grade: data.grade,
      feedback: data.feedback,
      attemptNumber,
    },
  });

  if (data.grade === "PASS") {
    await prisma.exercise.update({
      where: { id: data.exerciseId },
      data: { passed: true },
    });
  }

  return submission;
}

export async function getExerciseWithRubric(exerciseId: string) {
  return prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: {
      id: true,
      question: true,
      rubric: true,
      passed: true,
      chapterId: true,
    },
  });
}
