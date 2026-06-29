import { AppShell } from "@/components/layout/AppShell";

/**
 * Shared layout for authenticated app routes (library, upload, workspace).
 * Wraps page content in the dashboard shell (header, sidebar, footer).
 */
const ShellLayout = ({ children }: { children: React.ReactNode }) => (
  <AppShell>{children}</AppShell>
);

export default ShellLayout;
