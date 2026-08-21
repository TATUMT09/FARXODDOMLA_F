export type TestStatus = "DRAFT" | "PUBLISHED";
export type QuestionOption = "A" | "B" | "C" | "D";

export interface Test {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  level: string | null;
  durationMinutes: number;
  status: TestStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: { questions: number; attempts: number };
}

export interface Question {
  id: string;
  testId: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: QuestionOption;
  order: number;
}

export interface TestWithQuestions extends Test {
  questions: Question[];
}

export interface CreateTestDto {
  title: string;
  description?: string;
  subject?: string;
  level?: string;
  durationMinutes: number;
  status?: TestStatus;
}

export interface CreateQuestionDto {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: QuestionOption;
  order: number;
}
