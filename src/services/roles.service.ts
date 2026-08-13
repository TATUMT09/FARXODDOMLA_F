import { apiClient } from "@/lib/api-client";
import type { Role } from "@/types/role";

export const rolesService = {
  list: async () => {
    const res = await apiClient.get<Role[]>("/roles");
    return res.data;
  },
};
