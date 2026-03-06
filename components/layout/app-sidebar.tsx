"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";
import {
  LayoutDashboard,
  Plus,
  BookOpen,
  GraduationCap,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCourseStore } from "@/lib/stores/course-store";

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActiveView, setActiveCourseId, clearMessages } = useCourseStore();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      // If we were viewing the deleted course, navigate away
      if (pathname === `/course/${courseId}`) {
        setActiveView({ type: "idle" });
        setActiveCourseId(null);
        clearMessages();
        router.push("/course/new");
      }
    },
  });

  return (
    <div className="w-56 h-full border-r border-border bg-sidebar flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-foreground flex items-center justify-center">
            <GraduationCap className="size-4 text-background" />
          </div>
          <span className="text-sm font-semibold">Course Builder</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
            pathname === "/dashboard"
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>

        <Link
          href="/course/new"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
            pathname === "/course/new"
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Plus className="size-4" />
          New Course
        </Link>

        {courses && courses.length > 0 && (
          <div className="pt-3 pb-1">
            <p className="px-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Recent Courses
            </p>
            {courses.slice(0, 8).map((course) => (
              <div
                key={course.id}
                className={cn(
                  "group flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                  pathname === `/course/${course.id}`
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Link
                  href={`/course/${course.id}`}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <BookOpen className="size-3.5 shrink-0" />
                  <span className="truncate flex-1 text-xs">{course.title}</span>
                  <span
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      statusColors[course.status] ?? "bg-zinc-500"
                    )}
                  />
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete course?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{course.title}&rdquo; and all its chapters will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => deleteMutation.mutate(course.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-2 pb-3">
        <Button asChild size="sm" className="w-full gap-1.5">
          <Link href="/course/new">
            <Plus className="size-3.5" />
            New Course
          </Link>
        </Button>
      </div>
    </div>
  );
}
