import { createCrudService } from "./crud-service";
import type { CreateSystemUserDto, SystemUser } from "@/types/user";

export const usersService = createCrudService<SystemUser, CreateSystemUserDto>(
  "users",
);
