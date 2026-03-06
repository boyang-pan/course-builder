import { create } from "zustand";
import type { Message } from "@/types/chat";
import type { GradeResult } from "@/types/course";

export type WorkspaceView =
  | { type: "idle" }
  | { type: "outline"; courseId: string }
  | { type: "chapter"; courseId: string; chapterId: string; chapterOrder: number }
  | { type: "exercise"; courseId: string; chapterId: string; exerciseId: string; exerciseOrder: number };

interface CourseStore {
  // Chat
  messages: Message[];
  isAITyping: boolean;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  updateLastMessage: (content: string) => void;
  setIsAITyping: (typing: boolean) => void;
  clearMessages: () => void;

  // Workspace
  activeView: WorkspaceView;
  setActiveView: (view: WorkspaceView) => void;

  // Streaming
  streamingContent: string;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  clearStreamingContent: () => void;

  // Grade result
  lastGradeResult: GradeResult | null;
  setLastGradeResult: (result: GradeResult | null) => void;

  // Active course
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  // Chat
  messages: [],
  isAITyping: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last) messages[messages.length - 1] = { ...last, content };
      return { messages };
    }),
  setIsAITyping: (typing) => set({ isAITyping: typing }),
  clearMessages: () => set({ messages: [] }),

  // Workspace
  activeView: { type: "idle" },
  setActiveView: (view) => set({ activeView: view }),

  // Streaming
  streamingContent: "",
  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),
  clearStreamingContent: () => set({ streamingContent: "" }),

  // Grade result
  lastGradeResult: null,
  setLastGradeResult: (result) => set({ lastGradeResult: result }),

  // Active course
  activeCourseId: null,
  setActiveCourseId: (id) => set({ activeCourseId: id }),
}));
