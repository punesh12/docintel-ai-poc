import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";

interface ChatState {
  threads: Record<string, ChatMessage[]>;
  addMessage: (documentId: string, message: ChatMessage) => void;
  clearThread: (documentId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  threads: {},

  addMessage: (documentId, message) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [documentId]: [...(state.threads[documentId] ?? []), message],
      },
    })),

  clearThread: (documentId) =>
    set((state) => {
      const nextThreads = { ...state.threads };
      delete nextThreads[documentId];
      return { threads: nextThreads };
    }),
}));
