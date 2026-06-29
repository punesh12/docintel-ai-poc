import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/utils/cn";

interface ChatMessageBubbleProps {
  message: ChatMessageType;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-body-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "rounded-br-md bg-primary-container text-on-primary"
            : "rounded-bl-md border border-border bg-surface-container-lowest text-on-surface"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
