export interface SystemSetting {
  id: string;
  centerName: string;
  address: string | null;
  phone: string | null;
  workingHours: string | null;
  currency: string;
  timezone: string;
  lateThresholdMinutes: number;
  updatedAt: string;
}

export type UpdateSettingsDto = Partial<
  Omit<SystemSetting, "id" | "updatedAt">
>;
