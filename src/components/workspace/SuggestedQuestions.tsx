interface SuggestedQuestionsProps {
  disabled?: boolean;
  onSelect: (question: string) => void;
}

const SUGGESTIONS = [
  "Summarize this document",
  "What are the key points?",
  "List any dates or deadlines",
];

export function SuggestedQuestions({ disabled, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="rounded-full border border-border bg-surface-container-low px-3 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:border-primary-container/30 hover:bg-primary-fixed/30 hover:text-primary-container disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
