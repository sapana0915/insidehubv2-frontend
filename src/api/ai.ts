import { api } from "./client";
import type { Draft, DraftInput, DraftUsage } from "../types";

export async function draftPost(input: DraftInput): Promise<Draft> {
  const { data } = await api.post<Draft>("/ai/drafts", input);
  return data;
}

export async function getDraftUsage(): Promise<DraftUsage> {
  const { data } = await api.get<DraftUsage>("/ai/drafts/usage");
  return data;
}
