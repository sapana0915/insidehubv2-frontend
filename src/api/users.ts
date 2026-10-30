import { api } from "./client";
import type { PublicUser, User, UserUpdateInput } from "../types";

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function updateMe(input: UserUpdateInput): Promise<User> {
  const { data } = await api.patch<User>("/users/me", input);
  return data;
}

export async function getProfile(id: string): Promise<PublicUser> {
  const { data } = await api.get<PublicUser>(`/users/${id}/profile`);
  return data;
}
