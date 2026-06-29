"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { navLinkClassName } from "@/components/layout/NavLink";
import { useRouteMatch } from "@/hooks/useRouteMatch";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/upload", label: "Upload" },
  { href: "/library", label: "Library" },
  { href: "/workspace", label: "Viewer" },
];

/** Primary top navigation: logo and Upload / Library / Viewer links. */
export const AppHeader = () => {
  const { isActive } = useRouteMatch();

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-border bg-surface-container-lowest px-6">
      <Link href="/library" className="mr-10 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container">
          <Sparkles className="h-4 w-4 text-on-primary" />
        </div>
        <span className="text-headline-md text-on-surface">DocIntel AI</span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              navLinkClassName(isActive(href)),
              "px-4 py-2 text-body-md"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
};
