/**
 * Tab bar layout helpers for the workspace document viewer.
 */

/** Width of the "Open document" picker menu (`w-72` = 288px). */
export const PICKER_MENU_WIDTH = 288;

/** Horizontal gap between the + button and the picker menu. */
export const PICKER_MENU_GAP = 8;

/** Returns true when the filename should show the PDF tab icon. */
export const isPdfFilename = (name: string) => name.toLowerCase().endsWith(".pdf");

/**
 * Computes min/max width for a tab based on how many are open.
 * Active tabs receive a small width bonus for emphasis.
 */
export const getTabDimensions = (tabCount: number, isActive: boolean) => {
  const activeBonus = isActive ? 20 : 0;

  if (tabCount <= 1) {
    return { minWidth: 120, maxWidth: 260 + activeBonus };
  }
  if (tabCount === 2) {
    return { minWidth: 100, maxWidth: 200 + activeBonus };
  }
  if (tabCount === 3) {
    return { minWidth: 90, maxWidth: 160 + activeBonus };
  }
  if (tabCount <= 5) {
    return { minWidth: 80, maxWidth: 130 + activeBonus };
  }
  if (tabCount <= 8) {
    return { minWidth: 72, maxWidth: 110 + activeBonus };
  }
  return { minWidth: 64, maxWidth: 96 + activeBonus };
};

/** Tailwind horizontal padding class — tighter when many tabs are open. */
export const getTabPaddingClass = (tabCount: number) => {
  if (tabCount > 5) return "px-2.5";
  if (tabCount > 3) return "px-3";
  return "px-4";
};
