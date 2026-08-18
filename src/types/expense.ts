export interface Expense {
  id: string;
  title: string;
  category: string | null;
  amount: string;
  spentAt: string;
  note: string | null;
  branchId: string;
}

export interface CreateExpenseDto {
  title: string;
  category?: string;
  amount: number;
  note?: string;
  branchId: string;
}
