"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from "../http/client";
import { clearAccessToken, getAccessToken, setAccessToken, subscribe } from "./tokenStore";
import { getCookie, deleteCookie } from "cookies-next";

type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(getAccessToken());

  // Sync local state with token store changes
  useEffect(() => {
    return subscribe((t) => setToken(t));
  }, []);

  // On mount, if there is no token, try refresh once to bootstrap from cookie
  useEffect(() => {
    if (!getAccessToken()) {
      const client = createBrowserClient();
      client
        .post<{ accessToken: string }>("/auth/refresh")
        .then((resp) => {
          if (resp.data?.accessToken) {
            setAccessToken(resp.data.accessToken);
          }
        })
        .catch(() => {
          // ignore; unauthenticated state
        });
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const client = createBrowserClient();
    const resp = await client.post<{ accessToken?: string; user?: any }>(
      "/auth/login",
      {
        identifier,
        password,
      }
    );
    const at = resp.data?.accessToken ?? null;
    setAccessToken(at);
    setToken(at);
  }, []);

  const register = useCallback(
    async (payload: { email: string; password: string; name?: string }) => {
      const client = createBrowserClient();
      const resp = await client.post<{ accessToken?: string; user?: any }>(
        "/auth/register",
        payload
      );
      const at = resp.data?.accessToken ?? null;
      setAccessToken(at);
      setToken(at);
    },
    []
  );

  const logout = useCallback(async () => {
    const client = createBrowserClient();
    try {
      await client.post("/auth/logout");
    } finally {
      // Ensure demo login cookie is cleared so middleware treats user as logged-out
      try { deleteCookie("token", { path: "/" }); } catch {}
      clearAccessToken();
      setToken(null);
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: token,
      // Re-evaluate cookie-based auth on route changes to keep header/middleware in sync
      isAuthenticated: !!token || !!getCookie("token"),
      login,
      register,
      logout,
    }),
    // include pathname so navigation (e.g. /login -> /) refreshes cookie-derived auth state
    [token, login, register, logout, pathname]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}