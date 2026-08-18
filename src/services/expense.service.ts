import { createCrudService } from "./crud-service";
import type { CreateExpenseDto, Expense } from "@/types/expense";

export const expenseService = createCrudService<Expense, CreateExpenseDto>(
  "expense",
);
