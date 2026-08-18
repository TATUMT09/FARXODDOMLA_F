export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface AttendanceRosterStudent {
  id: string;
  fullName: string;
  studentCode: string;
  status: AttendanceStatus | null;
  note: string | null;
}

export interface AttendanceRoster {
  group: { id: string; name: string };
  date: string;
  students: AttendanceRosterStudent[];
}

export interface MarkAttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface MarkAttendanceDto {
  groupId: string;
  date: string;
  records: MarkAttendanceRecord[];
}
