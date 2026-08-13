export interface Course {
  id: string;
  name: string;
  category: string | null;
  durationWeeks: number | null;
  price: string;
  branchId: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateCourseDto {
  name: string;
  category?: string;
  durationWeeks?: number;
  price: number;
  branchId: string;
}
