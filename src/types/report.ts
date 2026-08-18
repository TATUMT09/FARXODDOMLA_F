import type { FinanceSummary } from "./finance";
import type { PaymentStats } from "./payment";

export interface ReportsOverview {
  students: { total: number; active: number; newThisMonth: number };
  teachers: number;
  employees: number;
  courses: number;
  groups: number;
  admissionsNew: number;
  finance: FinanceSummary;
  payments: PaymentStats;
  attendanceThisMonth: Record<string, number>;
}
