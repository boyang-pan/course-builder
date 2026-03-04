import { CHAPTERS_PER_COURSE, CHAPTER_EXERCISES_DELIMITER, EXERCISES_PER_CHAPTER } from "@/lib/constants";

export function outlinePrompt(topic: string): { system: string; user: string } {
  return {
    system: `You are an expert curriculum designer. Generate structured, adaptive learning courses.
Always respond with valid JSON only — no markdown code fences, no extra text.`,
    user: `Create a ${CHAPTERS_PER_COURSE}-chapter course outline for the topic: "${topic}".

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
    "question": "A challenging open-ended question that requires synthesis and application of the chapter material",
    "rubric": "Detailed rubric for AI grading: what a PASS answer must demonstrate, common failure modes, specific concepts that must be addressed"
  }
]

Requirements:
- Questions should require genuine understanding, not just recall
- Rubrics should be detailed enough for consistent AI grading
- Questions should build on each other in complexity`,
  };
}

export function gradePrompt(
  question: string,
  rubric: string,
  answer: string
): { system: string; user: string } {
  return {
    system: `You are a fair and constructive educational assessor. Grade student answers objectively based on the provided rubric.
Always respond with valid JSON only — no markdown code fences, no extra text.`,
    user: `Grade this student answer for the following question.

QUESTION:
${question}

GRADING RUBRIC (private — do not reveal to student):
${rubric}

STUDENT ANSWER:
${answer}

Evaluate the answer against the rubric. Return JSON in this exact shape:
{
  "grade": "PASS" or "FAIL",
  "feedback": "2-4 sentences of constructive feedback. If PASS, affirm what was done well. If FAIL, explain specifically what is missing and how to improve — without giving away the answer."
}

Grade as PASS only if the answer demonstrates genuine understanding of the key concepts in the rubric.`,
  };
}
