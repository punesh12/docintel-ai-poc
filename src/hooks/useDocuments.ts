import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchDocuments } from "@/services/document.service";
import { useWorkspaceStore } from "@/store/workspace.store";

/**
 * Fetches documents from Supabase and mirrors them into the workspace store.
 *
 * Polls every 3s while any document is `uploading` or `processing`.
 */
export const useDocuments = () => {
  const queryClient = useQueryClient();
  const setDocuments = useWorkspaceStore((s) => s.setDocuments);
  const documents = useWorkspaceStore((s) => s.documents);

  const query = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
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
    }
  }, [query.data, setDocuments]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["documents"] });

  return {
    documents,
    isLoading: query.isLoading,
    error: query.error,
    invalidate,
  };
};
