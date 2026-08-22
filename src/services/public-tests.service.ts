import { publicApiClient } from "@/lib/public-api-client";
import type {
  AttemptDetail,
  AttemptSummary,
  PlatformStats,
  PublicTestSummary,
  StartTestResponse,
  StatsMe,
  SubmitAnswer,
  SubmitResult,
} from "@/types/public-test";

export const publicTestsService = {
  list: async (params: { subject?: string; level?: string } = {}) => {
    const res = await publicApiClient.get<PublicTestSummary[]>("/tests", {
      params,
    });
    return res.data;
  },
  platformStats: async () => {
    const res = await publicApiClient.get<PlatformStats>("/platform-stats");
    return res.data;
  },
  start: async (testId: string) => {
    const res = await publicApiClient.post<StartTestResponse>(
      `/tests/${testId}/start`,
    );
    return res.data;
  },
  submit: async (attemptId: string, answers: SubmitAnswer[]) => {
    const res = await publicApiClient.post<SubmitResult>(
      `/attempts/${attemptId}/submit`,
      { answers },
    );
    return res.data;
  },
  myAttempts: async () => {
    const res = await publicApiClient.get<AttemptSummary[]>("/attempts");
    return res.data;
  },
  getAttempt: async (attemptId: string) => {
    const res = await publicApiClient.get<AttemptDetail>(
      `/attempts/${attemptId}`,
    );
    return res.data;
  },
  statsMe: async () => {
    const res = await publicApiClient.get<StatsMe>("/stats/me");
    return res.data;
  },
};
