export interface Group {
  id: string;
  name: string;
  courseId: string;
  teacherId: string | null;
  roomName: string | null;
  maxStudents: number | null;
  branchId: string;
  status: "ACTIVE" | "INACTIVE";
  course?: { id: string; name: string };
  teacher?: { id: string; fullName: string } | null;
}

export interface CreateGroupDto {
  name: string;
  courseId: string;
  teacherId?: string;
  roomName?: string;
  maxStudents?: number;
  branchId: string;
}
