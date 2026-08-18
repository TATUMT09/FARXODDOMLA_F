export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  login: string | null;
  role: string;
  branchId: string | null;
  status: "ACTIVE" | "INACTIVE";
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AuthSession {
  id: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}
