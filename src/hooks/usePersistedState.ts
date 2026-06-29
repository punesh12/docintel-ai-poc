import { useCallback, useState } from "react";

const readStoredBoolean = (key: string, defaultValue: boolean) => {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return stored === "true";
};

/**
 * Boolean state synced to `localStorage`.
 *
 * On mount, reads the stored value if present; otherwise keeps `defaultValue`.
 * Writes on every `setValue` or `toggle`.
 *
 * @param key - `localStorage` key (e.g. `"docintel-sidebar-collapsed"`).
 * @param defaultValue - Initial value when nothing is stored.
 * @returns `[value, setValue, toggle]` tuple.
 */
export const usePersistedBoolean = (key: string, defaultValue: boolean) => {
  const [value, setValueState] = useState(() => readStoredBoolean(key, defaultValue));

  const setValue = useCallback(
    (next: boolean) => {
      setValueState(next);
      localStorage.setItem(key, String(next));
    },
    [key]
  );

  const toggle = useCallback(() => {
    setValueState((prev) => {
      const next = !prev;
      localStorage.setItem(key, String(next));
      return next;
    });
  }, [key]);

  return [value, setValue, toggle] as const;
};
