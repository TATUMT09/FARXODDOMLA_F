import { createCrudService } from "./crud-service";
import type { CreateEmployeeDto, Employee } from "@/types/employee";

export const employeesService = createCrudService<Employee, CreateEmployeeDto>(
  "employees",
);
