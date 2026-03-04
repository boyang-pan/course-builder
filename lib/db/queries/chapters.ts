import { prisma } from "@/lib/db/client";

export async function getChapterById(chapterId: string) {
  return prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getChapterByCourseAndOrder(
  courseId: string,
  order: number
) {
  return prisma.chapter.findUnique({
    where: { courseId_order: { courseId, order } },
    include: {
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function createChapter(data: {
  courseId: string;
  order: number;
  title: string;
  summary: string;
}) {
  return prisma.chapter.create({
    data: {
      courseId: data.courseId,
      order: data.order,
      title: data.title,
      summary: data.summary,
      status: "GENERATING",
    },
  });
}

export async function updateChapterContent(
  chapterId: string,
  content: string,
  exercises: Array<{ order: number; question: string; rubric: string }>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.$transaction(async (tx: any) => {
    const chapter = await tx.chapter.update({
      where: { id: chapterId },
      data: {
        content,
        status: "AVAILABLE",
        generatedAt: new Date(),
      },
    });

    if (exercises.length > 0) {
      await tx.exercise.createMany({
        data: exercises.map((e) => ({
          chapterId,
          order: e.order,
          question: e.question,
          rubric: e.rubric,
        })),
      });
    }

    return chapter;
  });
}

export async function updateChapterStatus(
  chapterId: string,
  status: "LOCKED" | "GENERATING" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED"
) {
  return prisma.chapter.update({
    where: { id: chapterId },
    data: { status },
  });
}

export async function markChapterCompleted(chapterId: string) {
  return prisma.chapter.update({
    where: { id: chapterId },
    data: { status: "COMPLETED" },
  });
}
