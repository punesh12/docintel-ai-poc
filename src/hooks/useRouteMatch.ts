import { usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Helpers for matching the current Next.js route against nav hrefs.
 *
 * Uses `pathname.startsWith(href)` so `/library/foo` matches `/library`.
 */
export const useRouteMatch = () => {
  const pathname = usePathname();

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  return { pathname, isActive };
};
