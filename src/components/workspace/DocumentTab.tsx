import { X } from "lucide-react";
import type { Document } from "@/types";
import { FileTabIcon, PdfTabIcon } from "@/components/icons/DocumentTabIcons";
import { cn } from "@/utils/cn";
import { getTabDimensions, isPdfFilename } from "@/utils/document-tabs";

interface DocumentTabProps {
  document: Document;
  isActive: boolean;
  /** Total number of open tabs — drives width scaling. */
  tabCount: number;
  /** When true, tabs use `flex: 1` to share row space. */
  compactTabs: boolean;
  /** Tailwind horizontal padding class from `getTabPaddingClass`. */
  tabPadding: string;
  onSelect: () => void;
  onClose: () => void;
}

/**
 * Single document tab in the workspace tab bar.
 * Renders active (elevated card + close) or inactive (muted text) variants.
 */
export const DocumentTab = ({
  document,
  isActive,
  tabCount,
  compactTabs,
  tabPadding,
  onSelect,
  onClose,
}: DocumentTabProps) => {
  const pdf = isPdfFilename(document.name);
  const tabSize = getTabDimensions(tabCount, isActive);
  const tabStyle = {
    minWidth: tabSize.minWidth,
    maxWidth: tabSize.maxWidth,
    flex: compactTabs ? ("1 1 0%" as const) : undefined,
  };

  if (isActive) {
    return (
      <div
        style={tabStyle}
        className={cn(
          "relative z-10 -mb-px flex min-w-0 shrink items-center gap-2 rounded-t-lg border border-b-0 border-border bg-surface-container-lowest py-2.5",
          tabPadding
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {pdf ? (
            <PdfTabIcon className="text-primary-container" />
          ) : (
            <FileTabIcon className="text-primary-container" />
          )}
          <span
            className="truncate text-[14px] font-bold leading-[22px] text-primary-container"
            title={document.name}
          >
            {document.name}
          </span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-primary-container/70 transition-colors hover:bg-primary-fixed/40 hover:text-primary-container"
          aria-label={`Close ${document.name}`}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      style={tabStyle}
      className={cn(
        "flex min-w-0 shrink items-center gap-2 py-2.5 text-on-surface-variant transition-colors hover:text-on-surface",
        tabPadding
      )}
    >
      {pdf ? (
        <PdfTabIcon className="text-[#6b7280]" />
      ) : (
        <FileTabIcon className="text-[#6b7280]" />
      )}
      <span className="truncate text-body-md" title={document.name}>
        {document.name}
      </span>
    </button>
  );
};
