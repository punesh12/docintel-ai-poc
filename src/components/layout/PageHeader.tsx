import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Page title (`text-headline-lg`). */
  title: string;
  /** Subtitle below the title. */
  description: string;
  /** Right-aligned actions (buttons, links). */
  actions?: ReactNode;
  /** Optional content below the title row (e.g. secondary links). */
  footer?: ReactNode;
}

/**
 * Standard page header used on Library, Upload, and similar full-page views.
 */
export const PageHeader = ({ title, description, actions, footer }: PageHeaderProps) => (
  <div className="border-b border-border px-6 py-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-headline-lg text-on-surface">{title}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">{description}</p>
      </div>
      {actions}
    </div>
    {footer}
  </div>
);
