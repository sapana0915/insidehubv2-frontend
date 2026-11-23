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
  organization_id: string;
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
  // OTP disabled for now — uncomment when email verification is required again:
  // code: string;
}

export interface SendCodeResult {
  message: string;
  expires_in: number;
  resend_in: number;
}

export type DraftLength = "short" | "medium" | "long";
export type DraftTone = "warm" | "simple" | "lively";

export interface DraftAnswer {
  question: string;
  answer: string;
}

export interface DraftInput {
  category: string;
  prompt: string;
  answers?: DraftAnswer[];
  length: DraftLength;
  tone: DraftTone;
  use_web_search?: boolean;
}

export interface DraftSource {
  title: string;
  url: string;
}

export interface Draft {
  status: "draft" | "questions";
  title: string | null;
  content: string | null;
  questions: string[];
  sources: DraftSource[];
  remaining_today: number;
}

export interface DraftUsage {
  limit: number;
  used: number;
  remaining: number;
  web_search_categories: string[];
}

export interface UserUpdateInput {
  username?: string;
  full_name?: string;
  email?: string;
  password?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by_id: string;
  role: string | null;
  owner_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationAdmin {
  id: string;
  name: string;
  slug: string;
  created_by_id: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  org_role: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrganizationCreateInput {
  name: string;
  slug?: string;
  owner_email: string;
  owner_username: string;
  owner_password: string;
  owner_full_name?: string;
}
