import axios, { AxiosError } from "axios";

export const API_URL: string =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api/v1";

const TOKEN_KEY = "insidehub.token";
export const LOGOUT_EVENT = "insidehub:logout";

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken) {
      tokenStore.clear();
      window.dispatchEvent(new Event(LOGOUT_EVENT));
    }
    return Promise.reject(error);
  },
);

type ValidationItem = { msg?: string; loc?: (string | number)[] };

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Can't reach the InsideHub server. Is the backend running?";
    }
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return (detail as ValidationItem[])
        .map((d) => {
          const field = d.loc?.filter((p) => p !== "body").join(".");
          const msg = (d.msg ?? "").replace(/^Value error, /, "");
          return field ? `${field}: ${msg}` : msg;
        })
        .join(" · ");
    }
  }
  return fallback;
}
