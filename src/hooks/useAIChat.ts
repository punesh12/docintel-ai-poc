"use client";

import { useCallback, useMemo, useState } from "react";
import { useChatStore } from "@/store/chat.store";
import type { ChatMessage } from "@/types/chat";

interface UseAIChatOptions {
  documentId: string | null;
  documentName?: string;
}

export function useAIChat({ documentId, documentName }: UseAIChatOptions) {
  const threads = useChatStore((state) => state.threads);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearThread = useChatStore((state) => state.clearThread);
  const [isStreaming, setIsStreaming] = useState(false);

  const messages = useMemo(
    () => (documentId ? (threads[documentId] ?? []) : []),
    [documentId, threads]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!documentId || !text || isStreaming) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };

      addMessage(documentId, userMessage);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            documentName,
            message: text,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat request failed");
        }

        const data = (await response.json()) as { reply?: string };
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? "Sorry, I could not generate a response.",
          createdAt: new Date().toISOString(),
        };

        addMessage(documentId, assistantMessage);
      } catch {
        addMessage(documentId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [addMessage, documentId, documentName, isStreaming]
  );

  const clearHistory = useCallback(() => {
    if (documentId) clearThread(documentId);
  }, [clearThread, documentId]);

  return {
    messages,
    isStreaming,
    sendMessage,
    clearHistory,
  };
}
