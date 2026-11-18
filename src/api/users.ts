import { api, errorMessage } from "./client";
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

function filenameFromDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback;
  const utf = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf?.[1]) return decodeURIComponent(utf[1]);
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1]?.trim() || fallback;
}

/** Downloads the authenticated user's journal as a PDF file. */
export async function exportMyWork(username: string): Promise<void> {
  try {
    const { data, headers } = await api.get<Blob>("/users/me/export.pdf", {
      responseType: "blob",
    });
    const filename = filenameFromDisposition(
      headers["content-disposition"] as string | undefined,
      `insidehub-${username}.pdf`,
    );
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const response = (error as { response?: { data?: Blob; status?: number } }).response;
      if (response?.data instanceof Blob) {
        try {
          const text = await response.data.text();
          const parsed = JSON.parse(text) as { detail?: unknown };
          if (typeof parsed.detail === "string") {
            throw new Error(parsed.detail);
          }
        } catch (inner) {
          if (inner instanceof Error && inner.message && !inner.message.startsWith("{")) {
            throw inner;
          }
        }
      }
    }
    throw new Error(errorMessage(error, "Couldn't prepare your PDF. Please try again."));
  }
}
