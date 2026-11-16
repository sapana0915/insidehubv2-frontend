import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as aiApi from "../api/ai";
import type { DraftInput, DraftUsage } from "../types";

const USAGE_KEY = ["ai", "usage"];

export function useDraftUsage(enabled = true) {
  return useQuery({ queryKey: USAGE_KEY, queryFn: aiApi.getDraftUsage, enabled, retry: false });
}

export function useDraftPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DraftInput) => aiApi.draftPost(input),
    onSuccess: (draft) => {
      qc.setQueryData<DraftUsage>(USAGE_KEY, (usage) =>
        usage ? { ...usage, used: usage.limit - draft.remaining_today, remaining: draft.remaining_today } : usage,
      );
    },
    onError: () => qc.invalidateQueries({ queryKey: USAGE_KEY }),
  });
}
