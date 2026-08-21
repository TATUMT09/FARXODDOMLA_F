export interface TestTakerUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  emailVerifiedAt: string | null;
}

export interface TestTakerAuthResponse {
  accessToken: string;
  testTaker: TestTakerUser;
}
