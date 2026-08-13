import { createCrudService } from "./crud-service";
import type { CreateStudentDto, Student } from "@/types/student";

export const studentsService = createCrudService<Student, CreateStudentDto>(
  "students",
);
