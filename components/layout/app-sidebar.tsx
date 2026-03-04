"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";
import {
  LayoutDashboard,
  Plus,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-green-500",
};

export function AppSidebar() {
  const pathname = usePathname();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="w-56 h-full border-r border-border bg-sidebar flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <GraduationCap className="size-4 text-white" />
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
              <Link
                key={course.id}
                href={`/course/${course.id}`}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                  pathname === `/course/${course.id}`
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
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
            ))}
          </div>
        )}
      </div>

      <div className="px-2 pb-3">
        <Button
          asChild
          size="sm"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
        >
          <Link href="/course/new">
            <Plus className="size-3.5" />
            New Course
          </Link>
        </Button>
      </div>
    </div>
  );
}
