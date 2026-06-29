"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { LibrarySidebar } from "@/components/layout/LibrarySidebar";
import { SidebarProvider } from "@/components/layout/SidebarProvider";
import { StatusFooter } from "@/components/layout/StatusFooter";

interface AppShellProps {
  children: React.ReactNode;
}

/** Top-level dashboard chrome: header, collapsible sidebar, main, footer. */
export const AppShell = ({ children }: AppShellProps) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <AppHeader />
        <div className="flex min-h-0 flex-1">
          <LibrarySidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="min-h-0 flex-1 overflow-hidden bg-surface-container-lowest">
              {children}
            </main>
            <StatusFooter />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
