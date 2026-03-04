export const CHAPTERS_PER_COURSE = 5;
export const EXERCISES_PER_CHAPTER = 3;
export const MAX_CHAPTER_TOKENS = 4096;
export const MAX_OUTLINE_TOKENS = 1024;
export const MAX_GRADE_TOKENS = 512;

export const CHAPTER_EXERCISES_DELIMITER = "<<<EXERCISES>>>";

export const WORKSPACE_VIEWS = {
  IDLE: "idle",
  OUTLINE: "outline",
  CHAPTER: "chapter",
  EXERCISE: "exercise",
} as const;
