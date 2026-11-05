import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as commentsApi from "../api/comments";

function commentsKey(postId: string) {
  return ["comments", postId] as const;
}

export function useComments(postId: string) {
  return useInfiniteQuery({
    queryKey: commentsKey(postId),
    queryFn: ({ pageParam }) => commentsApi.listComments(postId, pageParam, commentsApi.COMMENT_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < commentsApi.COMMENT_PAGE_SIZE ? undefined : pages.length * commentsApi.COMMENT_PAGE_SIZE,
  });
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsApi.createComment(postId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(postId) }),
  });
}

export function useUpdateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => commentsApi.updateComment(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(postId) }),
  });
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.deleteComment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(postId) }),
  });
}
