export interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
}
