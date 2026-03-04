import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCoursesByUser } from "@/lib/db/queries/courses";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, BookOpen, ArrowRight } from "lucide-react";

const statusConfig = {
  DRAFT: { label: "Draft", variant: "secondary" as const },
  IN_PROGRESS: { label: "In Progress", variant: "default" as const },
  COMPLETED: { label: "Completed", variant: "outline" as const },
};

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
          <Button
            asChild
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Link href="/course/new">
              <Plus className="size-4" />
              New Course
            </Link>
          </Button>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-2xl bg-violet-600/10 flex items-center justify-center mb-6">
              <BookOpen className="size-8 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No courses yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Describe any topic and AI will generate a personalized adaptive
              course just for you.
            </p>
            <Button
              asChild
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <Link href="/course/new">
                <Plus className="size-4" />
                Create your first course
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: {
              id: string;
              title: string;
              description: string;
              status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
              outline: unknown;
              createdAt: Date;
              chapters?: Array<{ id: string; status: string; order: number }>;
            }) => {
              const outlineItems = (course.outline as Array<{
                order: number;
                title: string;
                summary: string;
              }>) ?? [];
              const completedChapters =
                course.chapters?.filter((c) => c.status === "COMPLETED")
                  .length ?? 0;
              const totalChapters = outlineItems.length;
              const progressPct =
                totalChapters > 0
                  ? Math.round((completedChapters / totalChapters) * 100)
                  : 0;

              const config = statusConfig[course.status];

              return (
                <Card
                  key={course.id}
                  className="group hover:border-violet-500/30 transition-colors cursor-pointer"
                >
                  <Link href={`/course/${course.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">
                          {course.title}
                        </CardTitle>
                        <Badge variant={config.variant} className="shrink-0 text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            {completedChapters} / {totalChapters} chapters
                          </span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(course.createdAt)}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
