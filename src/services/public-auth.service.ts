import { publicApiClient } from "@/lib/public-api-client";
import type { TestTakerAuthResponse } from "@/types/test-taker";

export const publicAuthService = {
  register: async (dto: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    const res = await publicApiClient.post<{ success: boolean }>(
      "/register",
      dto,
    );
    return res.data;
  },
  verifyEmail: async (email: string, code: string) => {
    const res = await publicApiClient.post<TestTakerAuthResponse>(
      "/verify-email",
      { email, code },
    );
    return res.data;
  },
};
