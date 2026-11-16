export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  username: string;
  full_name: string | null;
  created_at: string;
  post_count: number;
}

export interface PostAuthor {
  id: string;
  username: string;
  full_name: string | null;
}

export interface PostImage {
  id: string;
  image_url: string;
  place_name: string | null;
  user_id: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  author: PostAuthor | null;
  images: PostImage[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface PostImageInput {
  url: string;
  place_name?: string | null;
}

export interface PostInput {
  title: string;
  content: string;
  category: string;
  images: PostImageInput[];
}

export interface CommentAuthor {
  id: string;
  username: string;
  full_name: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  author: CommentAuthor | null;
  content: string;
  like_count: number;
  liked: boolean;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface LikeStatus {
  post_id: string;
  like_count: number;
  liked: boolean;
}

export interface CommentLikeStatus {
  comment_id: string;
  like_count: number;
  liked: boolean;
}

export interface PostFilters {
  category?: string;
  author_id?: string;
  search?: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  full_name?: string;
  password: string;
  code: string;
}

export interface SendCodeResult {
  message: string;
  expires_in: number;
  resend_in: number;
}

export type DraftLength = "short" | "medium" | "long";
export type DraftTone = "warm" | "simple" | "lively";

export interface DraftInput {
  category: string;
  notes: string;
  where?: string;
  when?: string;
  who?: string;
  detail?: string;
  feeling?: string;
  length: DraftLength;
  tone: DraftTone;
}

export interface Draft {
  title: string;
  content: string;
  remaining_today: number;
}

export interface DraftUsage {
  limit: number;
  used: number;
  remaining: number;
}

export interface UserUpdateInput {
  username?: string;
  full_name?: string;
  email?: string;
  password?: string;
}
