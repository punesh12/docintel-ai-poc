"use client";

import { createContext, useContext } from "react";
import { usePersistedBoolean } from "@/hooks/usePersistedState";

const STORAGE_KEY = "docintel-sidebar-collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Provides collapsible sidebar state persisted in `localStorage`.
 * Defaults to collapsed on first visit.
 */
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed, toggle] = usePersistedBoolean(STORAGE_KEY, true);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

/** Access sidebar collapse state. Must be used inside `SidebarProvider`. */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};
