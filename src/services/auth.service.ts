import { apiClient } from "@/lib/api-client";
import type { AuthSession } from "@/types/auth";

export const authService = {
  sessions: async () => {
    const res = await apiClient.get<AuthSession[]>("/auth/sessions");
    return res.data;
  },
};
