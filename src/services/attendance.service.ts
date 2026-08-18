import { apiClient } from "@/lib/api-client";
import type { AttendanceRoster, MarkAttendanceDto } from "@/types/attendance";

export const attendanceService = {
  getRoster: async (groupId: string, date: string) => {
    const res = await apiClient.get<AttendanceRoster>("/attendance", {
      params: { groupId, date },
    });
    return res.data;
  },
  mark: async (dto: MarkAttendanceDto) => {
    const res = await apiClient.post("/attendance/mark", dto);
    return res.data;
  },
};
