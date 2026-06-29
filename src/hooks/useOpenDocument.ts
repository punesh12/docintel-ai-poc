import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useWorkspaceStore } from "@/store/workspace.store";

/**
 * Opens a document in the workspace tab viewer and navigates to `/workspace`.
 *
 * Use from the library table, picker menu, or any entry point that should
 * land the user on the PDF viewer with the document tab active.
 */
export const useOpenDocument = () => {
  const router = useRouter();
  const openTab = useWorkspaceStore((state) => state.openTab);

  const openDocument = useCallback(
    (documentId: string) => {
      openTab(documentId);
      router.push("/workspace");
    },
    [openTab, router]
  );

  return openDocument;
};
