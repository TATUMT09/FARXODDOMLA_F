export type AdmissionStatus =
  | "NEW"
  | "CONTACTED"
  | "TRIAL"
  | "ENROLLED"
  | "REJECTED"
  | "CANCELLED";

export interface Admission {
  id: string;
  fullName: string;
  phone: string;
  courseInterest: string | null;
  age: number | null;
  preferredTime: string | null;
  note: string | null;
  status: AdmissionStatus;
  branchId: string | null;
  convertedStudentId: string | null;
  createdAt: string;
}

export interface CreateAdmissionDto {
  fullName: string;
  phone: string;
  courseInterest?: string;
  age?: number;
  preferredTime?: string;
  note?: string;
}

export interface UpdateAdmissionDto {
  status?: AdmissionStatus;
  note?: string;
  branchId?: string;
}
