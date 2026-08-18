import { apiClient } from "@/lib/api-client";
import type { ReportsOverview } from "@/types/report";

export const reportsService = {
  overview: async () => {
    const res = await apiClient.get<ReportsOverview>("/reports/overview");
    return res.data;
  },
};
