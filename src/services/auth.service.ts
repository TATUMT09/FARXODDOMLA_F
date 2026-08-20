import { apiClient } from "@/lib/api-client";
import type { AuthSession } from "@/types/auth";

export const authService = {
  sessions: async () => {
    const res = await apiClient.get<AuthSession[]>("/auth/sessions");
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post<{ success: boolean }>(
      "/auth/forgot-password",
      { email },
    );
    return res.data;
  },
  verifyResetCode: async (email: string, code: string) => {
    const res = await apiClient.post<{ resetToken: string }>(
      "/auth/verify-reset-code",
      { email, code },
    );
    return res.data;
  },
  resetPassword: async (resetToken: string, newPassword: string) => {
    const res = await apiClient.post<{ success: boolean }>(
      "/auth/reset-password",
      { resetToken, newPassword },
    );
    return res.data;
  },
};
