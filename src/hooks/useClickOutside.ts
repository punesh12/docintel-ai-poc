import { useEffect, type RefObject } from "react";

type ClickOutsideTarget = RefObject<HTMLElement | null>;

/**
 * Closes overlays when the user clicks outside the given element refs.
 *
 * The listener is deferred by one tick so the click that opens the overlay
 * does not immediately trigger a close.
 *
 * @param enabled - When false, no listener is attached.
 * @param targets - Refs treated as "inside" the overlay (clicks here are ignored).
 * @param onOutsideClick - Called when a click lands outside all targets.
 */
export const useClickOutside = (
  enabled: boolean,
  targets: ClickOutsideTarget[],
  onOutsideClick: () => void
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInside = targets.some((ref) => ref.current?.contains(target));
      if (!clickedInside) onOutsideClick();
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [enabled, onOutsideClick, targets]);
};
