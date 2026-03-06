export interface OutlineProposal {
  chapters: Array<{ order: number; title: string; summary: string }>;
}

export function parseOutlineProposal(text: string): OutlineProposal | null {
  const match = text.match(/<outline_proposal>([\s\S]*?)<\/outline_proposal>/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every(
        (item) =>
          typeof item.order === "number" &&
          typeof item.title === "string" &&
          typeof item.summary === "string"
      )
    )
      return null;
    return { chapters: parsed };
  } catch {
    return null;
  }
}

export function stripOutlineProposalTag(text: string): string {
  return text.replace(/<outline_proposal>[\s\S]*?<\/outline_proposal>/g, "").trim();
}
