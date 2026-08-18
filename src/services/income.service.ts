import { createCrudService } from "./crud-service";
import type { CreateIncomeDto, Income } from "@/types/income";

export const incomeService = createCrudService<Income, CreateIncomeDto>(
  "income",
);
