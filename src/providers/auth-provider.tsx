"use client";

import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { setAccessToken } from "@/lib/token-store";
import type { AuthUser, LoginResponse } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const router = useRouter();

  useEffect(() => {
    axios
      .post<LoginResponse>(
        "/api/v1/auth/refresh",
        {},
        { withCredentials: true },
      )
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setStatus("authenticated");
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const res = await apiClient.post<LoginResponse>("/auth/login", {
        identifier,
        password,
      });
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      setStatus("authenticated");
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await apiClient.post("/auth/logout").catch(() => undefined);
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
