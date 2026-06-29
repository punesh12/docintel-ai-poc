import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface NavLinkProps {
  href: string;
  label: string;
  /** Whether this route is currently active. */
  active?: boolean;
  /** Optional leading icon (sidebar items). */
  icon?: LucideIcon;
  /** Hide label and center icon (collapsed sidebar). */
  collapsed?: boolean;
  className?: string;
}

/**
 * Shared active/inactive styles for header and sidebar navigation links.
 */
export const navLinkClassName = (active: boolean, extra?: string) =>
  cn(
    "rounded-lg transition-colors",
    active ? "nav-link-active" : "font-medium text-on-surface-variant no-underline hover:text-on-surface",
    extra
  );

/**
 * Next.js `Link` with consistent nav styling for AppHeader and LibrarySidebar.
 */
export const NavLink = ({
  href,
  label,
  active = false,
  icon: Icon,
  collapsed = false,
  className,
}: NavLinkProps) => (
  <Link
    href={href}
    title={label}
    className={cn(
      navLinkClassName(active, className),
      Icon && "flex items-center gap-2",
      collapsed && "justify-center px-0"
    )}
  >
    {Icon && <Icon className="h-4 w-4 shrink-0" />}
    {!collapsed && <span>{label}</span>}
  </Link>
);
