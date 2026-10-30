import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import * as authApi from "../api/auth";
import { getMe } from "../api/users";
import { LOGOUT_EVENT, tokenStore } from "../api/client";
import type { RegisterInput, User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function validToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (exp && exp * 1000 <= Date.now()) {
      tokenStore.clear();
      return null;
    }
    return token;
  } catch {
    tokenStore.clear();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => validToken(tokenStore.get()));

  const meQuery = useQuery({
    queryKey: ["me", token],
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    queryClient.removeQueries({ queryKey: ["me"] });
  }, [queryClient]);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener(LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, onLogout);
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp) return;
    const timer = window.setTimeout(logout, exp * 1000 - Date.now());
    return () => window.clearTimeout(timer);
  }, [token, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password);
    tokenStore.set(access_token);
    setToken(access_token);
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      await authApi.register(input);
      await login(input.email, input.password);
    },
    [login],
  );

  const value = useMemo<AuthState>(
    () => ({
      token,
      user: meQuery.data ?? null,
      isLoading: Boolean(token) && meQuery.isPending,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, meQuery.data, meQuery.isPending, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
