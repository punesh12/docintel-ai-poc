"use client";

import { useEffect, useRef } from "react";
import { Clock, Sparkles, X } from "lucide-react";
import { ChatMessageBubble } from "@/components/workspace/ChatMessage";
import { ChatInput } from "@/components/workspace/ChatInput";
import { SuggestedQuestions } from "@/components/workspace/SuggestedQuestions";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/utils/cn";

interface AIChatSheetProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentName?: string;
}

export function AIChatSheet({
  open,
  onClose,
  documentId,
  documentName,
}: AIChatSheetProps) {
  const { messages, isStreaming, sendMessage, clearHistory } = useAIChat({
    documentId,
    documentName,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages, isStreaming]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close AI assistant"
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-border bg-surface-container-lowest shadow-[var(--shadow-popover)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-container" />
                <h2 className="text-headline-md text-on-surface">DocIntel Assistant</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Online
                </span>
              </div>
              {documentName && (
                <p className="mt-1 truncate text-body-sm text-on-surface-variant">
                  Analyzing: {documentName}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={clearHistory}
                disabled={!documentId || messages.length === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40"
                aria-label="Clear chat history"
                title="Clear history"
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-body-md text-on-surface-variant">
                Ask questions about the active document. Responses are mocked for this POC.
              </p>
              <SuggestedQuestions disabled={!documentId || isStreaming} onSelect={sendMessage} />
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
              {isStreaming && (
                <p className="text-body-sm text-on-surface-variant">Thinking…</p>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <ChatInput
          disabled={!documentId || isStreaming}
          onSend={sendMessage}
        />
      </aside>
    </>
  );
}
