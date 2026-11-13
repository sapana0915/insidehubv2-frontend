import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import * as commentsApi from "../api/comments";
import * as likesApi from "../api/likes";
import type { Comment } from "../types";

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

function withLike(
  data: InfiniteData<Comment[]> | undefined,
  id: string,
  like: Pick<Comment, "like_count" | "liked">,
) {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => page.map((comment) => (comment.id === id ? { ...comment, ...like } : comment))),
  };
}

export function useToggleCommentLike(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean; likeCount: number }) =>
      liked ? likesApi.unlikeComment(id) : likesApi.likeComment(id),
    onMutate: async ({ id, liked, likeCount }) => {
      await qc.cancelQueries({ queryKey: commentsKey(postId) });
      const previous = qc.getQueryData<InfiniteData<Comment[]>>(commentsKey(postId));
      qc.setQueryData<InfiniteData<Comment[]>>(commentsKey(postId), (current) =>
        withLike(current, id, {
          liked: !liked,
          like_count: Math.max(0, likeCount + (liked ? -1 : 1)),
        }),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) qc.setQueryData(commentsKey(postId), context.previous);
    },
    onSuccess: (status) => {
      qc.setQueryData<InfiniteData<Comment[]>>(commentsKey(postId), (current) =>
        withLike(current, status.comment_id, { liked: status.liked, like_count: status.like_count }),
      );
    },
  });
}
