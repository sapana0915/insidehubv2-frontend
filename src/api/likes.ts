import { api } from "./client";
import type { CommentLikeStatus, LikeStatus } from "../types";

export async function getLikes(postId: string): Promise<LikeStatus> {
  const { data } = await api.get<LikeStatus>(`/posts/${postId}/likes`);
  return data;
}

export async function likePost(postId: string): Promise<LikeStatus> {
  const { data } = await api.post<LikeStatus>(`/posts/${postId}/like`);
  return data;
}

export async function unlikePost(postId: string): Promise<LikeStatus> {
  const { data } = await api.delete<LikeStatus>(`/posts/${postId}/like`);
  return data;
}

export async function likeComment(commentId: string): Promise<CommentLikeStatus> {
  const { data } = await api.post<CommentLikeStatus>(`/comments/${commentId}/like`);
  return data;
}

export async function unlikeComment(commentId: string): Promise<CommentLikeStatus> {
  const { data } = await api.delete<CommentLikeStatus>(`/comments/${commentId}/like`);
  return data;
}
