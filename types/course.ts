export type CourseStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED";
export type ChapterStatus =
  | "LOCKED"
  | "GENERATING"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED";
export type SubmissionGrade = "PASS" | "FAIL";

export interface ChapterOutlineItem {
  order: number;
  title: string;
  summary: string;
}

export interface Course {
  id: string;
  userId: string;
  title: string;
  description: string;
  topic: string;
  outline: ChapterOutlineItem[];
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  content: string | null;
  status: ChapterStatus;
  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  chapterId: string;
  order: number;
  question: string;
  passed: boolean;
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  exerciseId: string;
  userId: string;
  answer: string;
  grade: SubmissionGrade;
  feedback: string;
  attemptNumber: number;
  createdAt: string;
}

export interface GradeResult {
  grade: SubmissionGrade;
  feedback: string;
  submissionId: string;
}
