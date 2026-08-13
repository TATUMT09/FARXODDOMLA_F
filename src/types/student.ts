export type StudentStatus =
  | "ACTIVE"
  | "PAUSED"
  | "GRADUATED"
  | "LEFT"
  | "DEBTOR"
  | "BLOCKED"
  | "TRIAL";

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  phone: string | null;
  parentPhone: string | null;
  status: StudentStatus;
  branchId: string;
  groupId: string | null;
  enrolledAt: string;
}

export interface CreateStudentDto {
  fullName: string;
  phone?: string;
  parentPhone?: string;
  branchId: string;
  groupId?: string;
}
