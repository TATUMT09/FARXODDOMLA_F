import { createCrudService } from "./crud-service";
import type { CreateGroupDto, Group } from "@/types/group";

export const groupsService = createCrudService<Group, CreateGroupDto>(
  "groups",
);
