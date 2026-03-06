import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCoursesByUser } from "@/lib/db/queries/courses";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { CourseGrid } from "@/components/dashboard/course-grid";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const courses = await getCoursesByUser(userId);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {courses.length === 0
                ? "Start your learning journey"
                : `${courses.length} course${courses.length === 1 ? "" : "s"} total`}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/course/new">
              <Plus className="size-4" />
              New Course
            </Link>
          </Button>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <BookOpen className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No courses yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Describe any topic and AI will generate a personalized adaptive
              course just for you.
            </p>
            <Button asChild className="gap-2">
              <Link href="/course/new">
                <Plus className="size-4" />
                Create your first course
              </Link>
            </Button>
          </div>
        ) : (
          <CourseGrid courses={courses} />
        )}
      </div>
    </div>
  );
}
