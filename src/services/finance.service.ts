import { apiClient } from "@/lib/api-client";
import type { FinanceSummary } from "@/types/finance";

export const financeService = {
  summary: async () => {
    const res = await apiClient.get<FinanceSummary>("/finance/summary");
    return res.data;
  },
};
