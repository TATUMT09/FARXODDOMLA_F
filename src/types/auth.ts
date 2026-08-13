export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  login: string | null;
  role: string;
  branchId: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
