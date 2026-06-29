/** SVG icons used in workspace document tabs. */

import { cn } from "@/utils/cn";

interface IconProps {
  className?: string;
}

/** Stacked-document icon with "PDF" label for `.pdf` files. */
export const PdfTabIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    className={cn("h-[18px] w-[18px] shrink-0", className)}
    aria-hidden
  >
    <rect x="3" y="2" width="11" height="14" rx="1.5" fill="currentColor" opacity="0.35" />
    <rect x="6" y="4" width="11" height="14" rx="1.5" fill="currentColor" />
    <text
      x="11.5"
      y="13.5"
      textAnchor="middle"
      fill="white"
      fontSize="5"
      fontWeight="700"
      fontFamily="Inter, system-ui, sans-serif"
    >
      PDF
    </text>
  </svg>
);

/** Generic document outline icon for non-PDF files. */
export const FileTabIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    className={cn("h-[18px] w-[18px] shrink-0", className)}
    aria-hidden
  >
    <rect
      x="4"
      y="2"
      width="12"
      height="16"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="7" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
