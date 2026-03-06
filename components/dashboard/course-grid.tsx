"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowRight, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

const statusConfig = {
  DRAFT: { label: "Draft", variant: "secondary" as const },
  IN_PROGRESS: { label: "In Progress", variant: "default" as const },
  COMPLETED: { label: "Completed", variant: "outline" as const },
};

type Course = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
  outline: unknown;
  createdAt: Date;
  chapters?: Array<{ id: string; status: string; order: number }>;
};

export function CourseGrid({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      router.refresh();
    },
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const outlineItems =
            (course.outline as Array<{ order: number; title: string; summary: string }>) ?? [];
          const completedChapters =
            course.chapters?.filter((c) => c.status === "COMPLETED").length ?? 0;
          const totalChapters = outlineItems.length;
          const progressPct =
            totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
          const config = statusConfig[course.status];

          return (
            <Card
              key={course.id}
              className="group hover:border-foreground/20 transition-colors relative"
            >
              {/* Settings menu */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive gap-2"
                      onClick={() => setConfirmId(course.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href={`/course/${course.id}`} className="block">
                <CardHeader className="pb-3 pr-8">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{course.title}</CardTitle>
                    <Badge variant={config.variant} className="shrink-0 text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        {completedChapters} / {totalChapters} chapters
                      </span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full transition-all"
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

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{courses.find((c) => c.id === confirmId)?.title}&rdquo; and all its chapters
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmId) deleteMutation.mutate(confirmId);
                setConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
