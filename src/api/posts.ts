import { api } from "./client";
import type { Post, PostFilters, PostInput } from "../types";

export const PAGE_SIZE = 12;

export async function listPosts(filters: PostFilters, skip = 0, limit = PAGE_SIZE): Promise<Post[]> {
  const params: Record<string, string | number> = { skip, limit };
  if (filters.category) params.category = filters.category;
  if (filters.author_id) params.author_id = filters.author_id;
  if (filters.search?.trim()) params.search = filters.search.trim();
  const { data } = await api.get<Post[]>("/posts", { params });
  return data;
}

export async function getPost(id: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${id}`);
  return data;
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data } = await api.post<Post>("/posts", input);
  return data;
}

export async function updatePost(id: string, input: Partial<PostInput>): Promise<Post> {
  const { data } = await api.patch<Post>(`/posts/${id}`, input);
  return data;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}

export async function uploadImage(file: File): Promise<string> {
  const { data } = await api.post<{ url: string }>("/posts/images", file, {
    headers: { "Content-Type": file.type },
  });
  return data.url;
}
