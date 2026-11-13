import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as likesApi from "../api/likes";
import type { LikeStatus } from "../types";

function likesKey(postId: string) {
  return ["likes", postId] as const;
}

export function useLikes(postId: string) {
  return useQuery({
    queryKey: likesKey(postId),
    queryFn: () => likesApi.getLikes(postId),
  });
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (currentlyLiked: boolean) =>
      currentlyLiked ? likesApi.unlikePost(postId) : likesApi.likePost(postId),
    onMutate: async (currentlyLiked) => {
      await qc.cancelQueries({ queryKey: likesKey(postId) });
      const previous = qc.getQueryData<LikeStatus>(likesKey(postId));
      if (previous) {
        qc.setQueryData<LikeStatus>(likesKey(postId), {
          ...previous,
          liked: !currentlyLiked,
          like_count: Math.max(0, previous.like_count + (currentlyLiked ? -1 : 1)),
        });
      }
      return { previous };
    },
    onError: (_error, _currentlyLiked, context) => {
      if (context?.previous) qc.setQueryData(likesKey(postId), context.previous);
    },
    onSuccess: (status) => qc.setQueryData(likesKey(postId), status),
  });
}
