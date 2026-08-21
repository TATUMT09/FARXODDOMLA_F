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
import { publicApiClient } from "@/lib/public-api-client";
import { setTestTakerAccessToken } from "@/lib/test-taker-token-store";
import type {
  TestTakerAuthResponse,
  TestTakerUser,
} from "@/types/test-taker";

type TestTakerAuthStatus = "loading" | "authenticated" | "unauthenticated";

interface TestTakerAuthContextValue {
  testTaker: TestTakerUser | null;
  status: TestTakerAuthStatus;
  login: (email: string, password: string) => Promise<void>;
  applyAuthResponse: (res: TestTakerAuthResponse) => void;
  logout: () => Promise<void>;
}

const TestTakerAuthContext = createContext<TestTakerAuthContextValue | null>(
  null,
);

export function TestTakerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [testTaker, setTestTaker] = useState<TestTakerUser | null>(null);
  const [status, setStatus] = useState<TestTakerAuthStatus>("loading");
  const router = useRouter();

  useEffect(() => {
    axios
      .post<TestTakerAuthResponse>(
        "/api/v1/public/refresh",
        {},
        { withCredentials: true },
      )
      .then((res) => {
        setTestTakerAccessToken(res.data.accessToken);
        setTestTaker(res.data.testTaker);
        setStatus("authenticated");
      })
      .catch(() => {
        setTestTakerAccessToken(null);
        setTestTaker(null);
        setStatus("unauthenticated");
      });
  }, []);

  const applyAuthResponse = useCallback((res: TestTakerAuthResponse) => {
    setTestTakerAccessToken(res.accessToken);
    setTestTaker(res.testTaker);
    setStatus("authenticated");
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await publicApiClient.post<TestTakerAuthResponse>(
        "/login",
        { email, password },
      );
      applyAuthResponse(res.data);
      router.push("/tests");
    },
    [router, applyAuthResponse],
  );

  const logout = useCallback(async () => {
    await publicApiClient.post("/logout").catch(() => undefined);
    setTestTakerAccessToken(null);
    setTestTaker(null);
    setStatus("unauthenticated");
    router.push("/tests/login");
  }, [router]);

  return (
    <TestTakerAuthContext.Provider
      value={{ testTaker, status, login, applyAuthResponse, logout }}
    >
      {children}
    </TestTakerAuthContext.Provider>
  );
}

export function useTestTakerAuth() {
  const ctx = useContext(TestTakerAuthContext);
  if (!ctx) {
    throw new Error(
      "useTestTakerAuth must be used within TestTakerAuthProvider",
    );
  }
  return ctx;
}
