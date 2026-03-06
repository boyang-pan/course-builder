import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateCourseOutline } from "@/lib/db/queries/courses";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { courseId } = await params;
  const body = await req.json();
  const { chapters } = body;

  if (
    !Array.isArray(chapters) ||
    chapters.length === 0 ||
    !chapters.every(
      (c: unknown) =>
        typeof (c as { order: unknown }).order === "number" &&
        typeof (c as { title: unknown }).title === "string" &&
        typeof (c as { summary: unknown }).summary === "string"
    )
  ) {
    return new NextResponse("Bad Request: invalid chapters", { status: 400 });
  }

  try {
    const updated = await updateCourseOutline(courseId, userId, chapters);
    return NextResponse.json(updated);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
