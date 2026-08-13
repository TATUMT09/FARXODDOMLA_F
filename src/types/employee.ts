export interface Employee {
  id: string;
  fullName: string;
  phone: string;
  position: string;
  baseSalary: string | null;
  branchId: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateEmployeeDto {
  fullName: string;
  phone: string;
  position: string;
  baseSalary?: number;
  branchId: string;
}
