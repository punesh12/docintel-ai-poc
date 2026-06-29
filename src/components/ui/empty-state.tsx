import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  /** Optional CTA below the message (e.g. upload button). */
  action?: ReactNode;
}

/**
 * Centered empty-state block for lists with no items.
 */
export const EmptyState = ({ icon: Icon, message, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <Icon className="h-10 w-10 text-on-surface-variant/40" />
    <p className="text-body-md text-on-surface-variant">{message}</p>
    {action}
  </div>
);
