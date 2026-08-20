export interface SystemUser {
  id: string;
  fullName: string;
  phone: string;
  login: string | null;
  email: string | null;
  roleId: string;
  branchId: string | null;
  status: "ACTIVE" | "INACTIVE";
  role?: { id: string; name: string };
}

export interface CreateSystemUserDto {
  fullName: string;
  phone: string;
  login?: string;
  email?: string;
  password: string;
  roleId: string;
  branchId?: string;
}
