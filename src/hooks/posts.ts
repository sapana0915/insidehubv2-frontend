import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as postsApi from "../api/posts";
import type { PostFilters, PostInput } from "../types";

export function usePostsFeed(filters: PostFilters, pageSize = postsApi.PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: ["posts", "feed", filters, pageSize],
    queryFn: ({ pageParam }) => postsApi.listPosts(filters, pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < pageSize ? undefined : pages.length * pageSize,
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ["posts", "detail", id],
    queryFn: () => postsApi.getPost(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => postsApi.createPost(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PostInput>) => postsApi.updatePost(id, input),
    onSuccess: (post) => {
      qc.setQueryData(["posts", "detail", id], post);
      qc.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUploadImage() {
  return useMutation({ mutationFn: (file: File) => postsApi.uploadImage(file) });
}
