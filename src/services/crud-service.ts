import { apiClient } from "@/lib/api-client";

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function createCrudService<TEntity, TCreateDto, TUpdateDto = Partial<TCreateDto>>(
  resource: string,
) {
  return {
    list: async (params: ListParams = {}) => {
      const res = await apiClient.get<PaginatedResult<TEntity>>(`/${resource}`, {
        params,
      });
      return res.data;
    },
    get: async (id: string) => {
      const res = await apiClient.get<TEntity>(`/${resource}/${id}`);
      return res.data;
    },
    create: async (dto: TCreateDto) => {
      const res = await apiClient.post<TEntity>(`/${resource}`, dto);
      return res.data;
    },
    update: async (id: string, dto: TUpdateDto) => {
      const res = await apiClient.patch<TEntity>(`/${resource}/${id}`, dto);
      return res.data;
    },
    remove: async (id: string) => {
      await apiClient.delete(`/${resource}/${id}`);
    },
  };
}
