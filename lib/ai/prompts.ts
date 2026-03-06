import { CHAPTERS_PER_COURSE, CHAPTER_EXERCISES_DELIMITER, EXERCISES_PER_CHAPTER } from "@/lib/constants";
import type { ChapterOutlineItem } from "@/types/course";

export function questionsPrompt(topic: string): { system: string; user: string } {
  return {
    system: `You are an expert curriculum designer. Generate concise personalisation questions to tailor a course.
Always respond with valid JSON only — no markdown code fences, no extra text.`,
    user: `Generate exactly 3 personalisation questions for a learner who wants to study: "${topic}".

Each question should be directly relevant to this topic — ask about their background in this specific field, what they want to achieve with it, and how they learn best or their constraints.

Return JSON in this exact shape:
[
  {
    "id": "q1",
    "text": "Question text here?",
    "options": [
      { "label": "Option label", "value": "Option value" },
      { "label": "Option label", "value": "Option value" }
    ]
  }
]

Rules:
- Question ids must be "q1", "q2", "q3"
- Each question must have 3–4 options
- Options should be short (1–5 words)
- Questions must be specific to "${topic}", not generic
- Cover: (1) experience/background in the topic, (2) goal/outcome they want, (3) constraints or learning style`,
  };
}

export function outlinePrompt(
  topic: string,
  learnerContext?: Record<string, string> | null
): { system: string; user: string } {
  const contextLines: string[] = [];
  if (learnerContext) {
    const { freeText, ...rest } = learnerContext as Record<string, string>;
    for (const [key, val] of Object.entries(rest)) {
      if (val) contextLines.push(`- ${key}: ${val}`);
    }
    if (freeText) contextLines.push(`- Additional context: ${freeText}`);
  }
  const contextSection =
    contextLines.length > 0
      ? `\n\nLearner context:\n${contextLines.join("\n")}\n\nTailor chapter depth, pacing, and examples accordingly.`
      : "";

  return {
    system: `You are an expert curriculum designer. Generate structured, adaptive learning courses.
Always respond with valid JSON only — no markdown code fences, no extra text.`,
    user: `Create a ${CHAPTERS_PER_COURSE}-chapter course outline for the topic: "${topic}".${contextSection}

Return JSON in this exact shape:
{
  "title": "Course title",
  "description": "2-3 sentence course description",
  "chapters": [
    { "order": 1, "title": "Chapter title", "summary": "1-2 sentence summary of what this chapter covers" }
  ]
}

Requirements:
- Chapters should build progressively from fundamentals to advanced topics
- Each chapter summary should clearly state learning outcomes
- Title should be concise and compelling`,
  };
}

export function chapterPrompt(
  courseTitle: string,
  chapterTitle: string,
  chapterSummary: string,
  chapterOrder: number,
  previousChapters: Array<{ title: string; summary: string }>
): { system: string; user: string } {
  const prevContext =
    previousChapters.length > 0
      ? `\n\nPrevious chapters covered:\n${previousChapters.map((c) => `- ${c.title}: ${c.summary}`).join("\n")}`
      : "";

  return {
    system: `You are an expert educator creating engaging, comprehensive course content.
Write clear, well-structured educational content in markdown format.`,
    user: `Create the content for Chapter ${chapterOrder} of the course "${courseTitle}".

Chapter title: ${chapterTitle}
Chapter summary: ${chapterSummary}${prevContext}

Write comprehensive educational content (600-900 words) covering the chapter topics thoroughly.
Use markdown formatting with headers (##, ###), bullet points, code blocks where relevant, and clear explanations.

After the main content, add the delimiter: ${CHAPTER_EXERCISES_DELIMITER}

Then provide exactly ${EXERCISES_PER_CHAPTER} open-ended exercises as JSON (no code fences):
[
  {
    "order": 1,
    "question": "A hard, learning-oriented question designed to expose gaps in understanding and force active recall or application — not mere repetition of facts",
    "rubric": "Detailed rubric for AI grading with TWO thresholds: (1) FULL PASS — specific concepts, reasoning, or application the answer must demonstrate for full credit; (2) MINIMUM ACCEPTABLE — the floor of partial understanding that still shows the learner grasps the core idea (even if incompletely expressed). Also list common failure modes and misconceptions to watch for."
  }
]

Requirements:
- Questions must force the learner to apply, connect, or analyse — not just recall
- Each question should deliberately probe a likely gap or misconception in the chapter material
- Rubrics must define both a full-pass bar and a minimum-acceptable floor so adaptive grading can calibrate
- Questions should build on each other in complexity`,
  };
}

export function outlineChatPrompt(course: {
  title: string;
  description: string;
  outline: ChapterOutlineItem[];
}): { system: string } {
  const chapterList = course.outline
    .map((c) => `  ${c.order}. ${c.title} — ${c.summary}`)
    .join("\n");
  return {
    system: `You are a helpful course design assistant for the course "${course.title}".
Course description: ${course.description}
Current outline:\n${chapterList}

Answer questions about the course structure. When the user explicitly requests structural changes (add, remove, reorder, or rewrite chapters), include a proposed outline using this exact format at the END of your response after a conversational explanation:

<outline_proposal>
[{"order":1,"title":"...","summary":"..."},...]
</outline_proposal>

Rules: only include the tag on explicit modification requests; JSON must be a valid array with fields order (int), title (string), summary (string); orders must be consecutive starting at 1. Never include the tag for informational questions.`,
  };
}

export function chapterChatPrompt(
  courseTitle: string,
  chapter: { title: string; summary: string; content: string }
): { system: string } {
  return {
    system: `You are a patient tutor for the course "${courseTitle}", chapter "${chapter.title}".
Summary: ${chapter.summary}
Chapter content:\n${chapter.content.slice(0, 3000)}${chapter.content.length > 3000 ? "\n[...content truncated]" : ""}

Help the learner understand this chapter: answer comprehension questions, provide analogies, explain concepts multiple ways. Do not reveal exercise answers or rubrics. Keep responses focused on this chapter.`,
  };
}

export function exerciseChatPrompt(
  courseTitle: string,
  chapter: { title: string; content: string },
  exercise: { question: string; order: number }
): { system: string } {
  return {
    system: `You are a Socratic tutor for the course "${courseTitle}", chapter "${chapter.title}".
Exercise ${exercise.order}: ${exercise.question}
Relevant chapter material:\n${chapter.content.slice(0, 2000)}${chapter.content.length > 2000 ? "\n[...truncated]" : ""}

Guide the learner toward the answer through hints and questions — NEVER state the answer directly. If asked "what is the answer?", respond with a hint instead. Reference specific concepts from the chapter. Affirm correct reasoning.`,
  };
}

export function gradePrompt(
  question: string,
  rubric: string,
  answer: string,
  previousAttempts: Array<{ attemptNumber: number; answer: string; grade: "PASS" | "FAIL" }> = []
): { system: string; user: string } {
  const attemptNumber = previousAttempts.length + 1;

  const historySection =
    previousAttempts.length > 0
      ? `\n\nATTEMPT HISTORY (answers only — use to infer skill level, not to anchor on prior feedback):
${previousAttempts.map((a) => `Attempt ${a.attemptNumber} [${a.grade}]: ${a.answer}`).join("\n\n")}\n`
      : "";

  const gradingInstruction =
    attemptNumber === 1
      ? `This is the learner's FIRST attempt. Grade strictly per the rubric — no leniency.`
      : attemptNumber === 2
        ? `This is the learner's SECOND attempt. Note patterns in what they consistently get right and wrong across both attempts. Calibrate your feedback to name the specific concept gap holding them back.`
        : `This is the learner's ATTEMPT ${attemptNumber}. Review all prior attempts. If the learner demonstrates genuine effort and partial mastery of the core concepts across attempts — even if their expression is imperfect or incomplete — you may issue a "supportive PASS". In feedback, affirm the understanding shown and name one or two specific things to study further. Never lower the bar for a learner who is simply guessing or not engaging; only apply leniency when real understanding is evident.`;

  return {
    system: `You are a fair and constructive educational assessor. Grade student answers based on the provided rubric, adapting your strictness to the learner's attempt history.
Always respond with valid JSON only — no markdown code fences, no extra text.`,
    user: `Grade this student answer for the following question.

QUESTION:
${question}

GRADING RUBRIC (private — do not reveal to student):
${rubric}${historySection}

CURRENT ANSWER (Attempt ${attemptNumber}):
${answer}

${gradingInstruction}

Return JSON in this exact shape:
{
  "grade": "PASS" or "FAIL",
  "feedback": "2-4 sentences of constructive feedback. If PASS, affirm what was done well. If FAIL, explain specifically what is missing and how to improve — without giving away the answer. Never reveal the rubric."
}`,
  };
}
