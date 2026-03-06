export type MessageRole = "user" | "assistant";
export type MessageType = "text" | "questions";

export interface CourseQuestion {
  id: string;
  text: string;
  options: { label: string; value: string }[];
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  isStreaming?: boolean;
  type?: MessageType;
  questions?: CourseQuestion[];
}
