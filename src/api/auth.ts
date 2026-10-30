import { api } from "./client";
import type { RegisterInput, Token, User } from "../types";

export async function login(email: string, password: string): Promise<Token> {
  const { data } = await api.post<Token>("/users/login", { email, password });
  return data;
}

export async function register(input: RegisterInput): Promise<User> {
  const { data } = await api.post<User>("/users/register", input);
  return data;
}
