import { useCallback, useState, type RefObject } from "react";

/** Viewport coordinates for a fixed-position dropdown menu. */
export interface MenuPosition {
  top: number;
  left: number;
}

interface UseAnchoredMenuOptions {
  /** Expected menu width in pixels (used for left-side placement). */
  menuWidth: number;
  /** Gap between anchor and menu edge. Defaults to 8px. */
  gap?: number;
  /** Vertical offset below the anchor. Defaults to 4px. */
  offsetTop?: number;
  /**
   * `left` — menu opens to the left of the anchor (right edge near the button).
   * `right` — menu left edge aligns with the anchor left edge.
   */
  placement?: "left" | "right";
}

/**
 * Manages open state and fixed positioning for a dropdown anchored to a button.
 *
 * @param anchorRef - Ref on the trigger element used for `getBoundingClientRect`.
 * @param options - Menu dimensions and placement.
 * @returns `open`, `position`, `toggle`, `close`, and `setOpen`.
 */
export const useAnchoredMenu = (
  anchorRef: RefObject<HTMLElement | null>,
  {
    menuWidth,
    gap = 8,
    offsetTop = 4,
    placement = "left",
  }: UseAnchoredMenuOptions
) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPosition(null);
  }, []);

  const toggle = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();

      setOpen((isOpen) => {
        const nextOpen = !isOpen;

        if (nextOpen && anchorRef.current) {
          const rect = anchorRef.current.getBoundingClientRect();
          const left =
            placement === "left"
              ? Math.max(gap, rect.left - menuWidth - gap)
              : rect.left;

          setPosition({ top: rect.bottom + offsetTop, left });
        } else {
          setPosition(null);
        }

        return nextOpen;
      });
    },
    [anchorRef, gap, menuWidth, offsetTop, placement]
  );

  return { open, position, toggle, close, setOpen };
};
