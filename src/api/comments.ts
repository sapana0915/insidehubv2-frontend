import { api } from "./client";
import type { Comment } from "../types";

export const COMMENT_PAGE_SIZE = 20;
export const MAX_COMMENT_LENGTH = 500;

export async function listComments(postId: string, skip = 0, limit = COMMENT_PAGE_SIZE): Promise<Comment[]> {
  const { data } = await api.get<Comment[]>("/comments", {
    params: { post_id: postId, skip, limit },
  });
  return data;
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  const { data } = await api.post<Comment>("/comments", { post_id: postId, content });
  return data;
}

export async function updateComment(id: string, content: string): Promise<Comment> {
  const { data } = await api.patch<Comment>(`/comments/${id}`, { content });
  return data;
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/comments/${id}`);
}
