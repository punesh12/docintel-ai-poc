import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { deleteDocument, fetchDocumentsFromApi } from "@/services/document.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { Document } from "@/types";

/**
 * Fetches documents from Supabase and mirrors them into the workspace store.
 *
 * Polls every 3s while any document is `uploading` or `processing`.
 */
export const useDocuments = () => {
  const queryClient = useQueryClient();
  const setDocuments = useWorkspaceStore((s) => s.setDocuments);
  const syncOpenedTabs = useWorkspaceStore((s) => s.syncOpenedTabs);
  const storeDocuments = useWorkspaceStore((s) => s.documents);

  const query = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocumentsFromApi,
    refetchInterval: (q) => {
      const hasProcessing = (q.state.data ?? []).some(
        (d) => d.status === "processing" || d.status === "uploading"
      );
      return hasProcessing ? 3000 : false;
    },
  });

  useEffect(() => {
    if (query.data) {
      setDocuments(query.data);
      syncOpenedTabs(query.data.map((document) => document.id));
    }
  }, [query.data, setDocuments, syncOpenedTabs]);

  const documents = query.data ?? storeDocuments;

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
    [queryClient]
  );

  const removeDocument = useCallback(
    async (document: Document) => {
      await deleteDocument(document);
      await invalidate();
    },
    [invalidate]
  );

  return {
    documents,
    isLoading: query.isLoading,
    error: query.error,
    invalidate,
    removeDocument,
  };
};
