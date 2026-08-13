import { createCrudService } from "./crud-service";
import type { Course, CreateCourseDto } from "@/types/course";

export const coursesService = createCrudService<Course, CreateCourseDto>(
  "courses",
);
