import { createCrudService } from "./crud-service";
import type { CreateTeacherDto, Teacher } from "@/types/teacher";

export const teachersService = createCrudService<Teacher, CreateTeacherDto>(
  "teachers",
);
