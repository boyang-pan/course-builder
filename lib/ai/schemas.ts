import { z } from "zod";

export const ChapterOutlineItemSchema = z.object({
  order: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string().min(1),
});

export const OutlineResponseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  chapters: z.array(ChapterOutlineItemSchema).min(1),
});

export const ExerciseSchema = z.object({
  order: z.number().int().positive(),
  question: z.string().min(1),
  rubric: z.string().min(1),
});

export const ExercisesArraySchema = z.array(ExerciseSchema);

export const GradeResponseSchema = z.object({
  grade: z.enum(["PASS", "FAIL"]),
  feedback: z.string().min(1),
});

export type OutlineResponse = z.infer<typeof OutlineResponseSchema>;
export type ExerciseItem = z.infer<typeof ExerciseSchema>;
export type GradeResponse = z.infer<typeof GradeResponseSchema>;
