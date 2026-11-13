import { api } from "./client";
import type { RegisterInput, SendCodeResult, Token } from "../types";

export async function login(email: string, password: string): Promise<Token> {
  const { data } = await api.post<Token>("/users/login", { email, password });
  return data;
}

export async function sendSignupCode(email: string, username: string): Promise<SendCodeResult> {
  const { data } = await api.post<SendCodeResult>("/users/register/send-code", { email, username });
  return data;
}

export async function register(input: RegisterInput): Promise<Token> {
  const { data } = await api.post<Token>("/users/register", input);
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/users/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/users/reset-password", { token, password });
  return data;
}
