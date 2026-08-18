import { apiClient } from "@/lib/api-client";
import { createCrudService } from "./crud-service";
import type {
  Admission,
  CreateAdmissionDto,
  UpdateAdmissionDto,
} from "@/types/admission";

const base = createCrudService<Admission, CreateAdmissionDto, UpdateAdmissionDto>(
  "admissions",
);

export const admissionsService = {
  ...base,
  convert: async (id: string, branchId: string) => {
    const res = await apiClient.post(`/admissions/${id}/convert`, { branchId });
    return res.data;
  },
};
