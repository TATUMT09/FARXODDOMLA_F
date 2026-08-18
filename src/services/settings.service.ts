import { apiClient } from "@/lib/api-client";
import type { SystemSetting, UpdateSettingsDto } from "@/types/setting";

export const settingsService = {
  get: async () => {
    const res = await apiClient.get<SystemSetting>("/settings");
    return res.data;
  },
  update: async (dto: UpdateSettingsDto) => {
    const res = await apiClient.patch<SystemSetting>("/settings", dto);
    return res.data;
  },
};
