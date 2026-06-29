"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
  onSend: (message: string) => void;
}

export function ChatInput({
  disabled,
  placeholder = "Ask about this document…",
  onSend,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
      <textarea
        rows={2}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
          }
        }}
        className="min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-sidebar px-3 py-2 text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/30 disabled:opacity-50"
      />
      <Button type="submit" size="icon" disabled={disabled || !value.trim()} aria-label="Send message">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
