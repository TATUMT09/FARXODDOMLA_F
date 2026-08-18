export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "ONLINE";
export type PaymentStatus = "COMPLETED" | "REFUNDED";

export interface Payment {
  id: string;
  studentId: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  note: string | null;
  student?: { id: string; fullName: string; studentCode: string };
  createdBy?: { id: string; fullName: string };
}

export interface CreatePaymentDto {
  studentId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
}

export interface PaymentStats {
  todayIncome: number;
  monthIncome: number;
  debtorsCount: number;
  totalDebt: number;
}

export interface DebtorRow {
  student: {
    id: string;
    studentCode: string;
    fullName: string;
    phone: string | null;
    parentPhone: string | null;
  };
  group: { id: string; name: string } | null;
  expected: number;
  paid: number;
  debt: number;
}
