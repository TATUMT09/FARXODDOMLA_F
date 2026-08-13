export type SalaryType =
  | "FIXED"
  | "PERCENTAGE"
  | "PER_STUDENT"
  | "FIXED_PLUS_PERCENTAGE"
  | "LESSON_BASED";

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  specialty: string | null;
  salaryType: SalaryType;
  baseSalary: string | null;
  percentage: string | null;
  branchId: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateTeacherDto {
  fullName: string;
  phone: string;
  specialty?: string;
  salaryType?: SalaryType;
  baseSalary?: number;
  percentage?: number;
  branchId: string;
}
