import { apiClient } from "@/lib/api-client";
import { createCrudService } from "./crud-service";
import type {
  CreateQuestionDto,
  CreateTestDto,
  Question,
  Test,
  TestWithQuestions,
} from "@/types/test";

const base = createCrudService<Test, CreateTestDto>("tests");

export const testsService = {
  ...base,
  get: async (id: string) => {
    const res = await apiClient.get<TestWithQuestions>(`/tests/${id}`);
    return res.data;
  },
  addQuestion: async (testId: string, dto: CreateQuestionDto) => {
    const res = await apiClient.post<Question>(
      `/tests/${testId}/questions`,
      dto,
    );
    return res.data;
  },
  updateQuestion: async (
    testId: string,
    questionId: string,
    dto: Partial<CreateQuestionDto>,
  ) => {
    const res = await apiClient.patch<Question>(
      `/tests/${testId}/questions/${questionId}`,
      dto,
    );
    return res.data;
  },
  removeQuestion: async (testId: string, questionId: string) => {
    await apiClient.delete(`/tests/${testId}/questions/${questionId}`);
  },
};
