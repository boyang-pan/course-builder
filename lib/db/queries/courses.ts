import { prisma } from "@/lib/db/client";
import type { ChapterOutlineItem } from "@/types/course";

export async function getCoursesByUser(userId: string) {
  return prisma.course.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      chapters: {
        select: { id: true, order: true, status: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getCourseById(courseId: string, userId: string) {
  return prisma.course.findFirst({
    where: { id: courseId, userId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              question: true,
              passed: true,
              submissions: {
                orderBy: { attemptNumber: "desc" },
                take: 1,
                select: {
                  id: true,
                  grade: true,
                  feedback: true,
                  attemptNumber: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createCourse(data: {
  userId: string;
  title: string;
  description: string;
  topic: string;
  outline: ChapterOutlineItem[];
}) {
  return prisma.course.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description,
      topic: data.topic,
      outline: data.outline,
      status: "DRAFT",
    },
  });
}

export async function updateCourseOutline(
  courseId: string,
  userId: string,
  outline: ChapterOutlineItem[]
) {
  return prisma.course.update({
    where: { id: courseId, userId },
    data: { outline },
  });
}

export async function deleteCourse(courseId: string, userId: string) {
  return prisma.course.delete({
    where: { id: courseId, userId },
  });
}

export async function updateCourseStatus(
  courseId: string,
  userId: string,
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED"
) {
  return prisma.course.update({
    where: { id: courseId, userId },
    data: { status },
  });
}
