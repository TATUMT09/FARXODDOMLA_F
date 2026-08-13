import { apiClient } from "@/lib/api-client";
import type { Branch } from "@/types/branch";

export const branchesService = {
  list: async () => {
    const res = await apiClient.get<Branch[]>("/branches");
    return res.data;
  },
};
