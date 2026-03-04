import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCourseById, updateCourseStatus } from "@/lib/db/queries/courses";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { courseId } = await params;
  const course = await getCourseById(courseId, userId);

  if (!course) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(course);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { courseId } = await params;
  const { status } = await req.json();

  const course = await updateCourseStatus(courseId, userId, status);
  return NextResponse.json(course);
}
