export interface Income {
  id: string;
  title: string;
  category: string | null;
  amount: string;
  receivedAt: string;
  note: string | null;
  branchId: string;
}

export interface CreateIncomeDto {
  title: string;
  category?: string;
  amount: number;
  note?: string;
  branchId: string;
}
