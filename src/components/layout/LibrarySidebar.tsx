"use client";

import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import { NavLink } from "@/components/layout/NavLink";
import { useSidebar } from "@/components/layout/SidebarProvider";
import { useRouteMatch } from "@/hooks/useRouteMatch";
import { cn } from "@/utils/cn";

const SIDEBAR_ITEMS = [{ href: "/library", label: "Library", icon: FolderOpen }];

/** Collapsible left sidebar with Library nav and collapse toggle. */
export const LibrarySidebar = () => {
  const { collapsed, toggle } = useSidebar();
  const { isActive } = useRouteMatch();

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <nav className="flex-1 p-2">
        <ul className="space-y-0.5">
          {SIDEBAR_ITEMS.map(({ href, label, icon }) => (
            <li key={href}>
              <NavLink
                href={href}
                label={label}
                icon={icon}
                active={isActive(href)}
                collapsed={collapsed}
                className="px-2 py-2 text-body-sm"
              />
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center gap-2 border-t border-border px-3 py-2.5 text-body-sm text-on-surface-variant hover:bg-surface-container-low"
      >
        {collapsed ? (
          <ChevronRight className="mx-auto h-4 w-4" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
};
