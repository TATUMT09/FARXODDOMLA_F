import type { QuestionOption } from "./test";

export interface PublicTestSummary {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  questionCount: number;
}

export interface PublicQuestion {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface StartTestResponse {
  attemptId: string;
  startedAt: string;
  durationMinutes: number;
  title: string;
  questions: PublicQuestion[];
}

export interface SubmitAnswer {
  questionId: string;
  selectedOption: QuestionOption;
}

export interface SubmitResult {
  totalQuestions: number;
  correctCount: number;
}

export interface AttemptSummary {
  id: string;
  testId: string;
  testTakerId: string;
  status: "IN_PROGRESS" | "SUBMITTED";
  totalQuestions: number;
  correctCount: number | null;
  startedAt: string;
  submittedAt: string | null;
  test: { title: string };
}

export interface AttemptAnswerDetail {
  questionId: string;
  selectedOption: QuestionOption | null;
  isCorrect: boolean;
  question: {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: QuestionOption;
  };
}

export interface AttemptDetail extends AttemptSummary {
  answers: AttemptAnswerDetail[];
}

export interface StatsMe {
  testsTaken: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  accuracyPercent: number;
  recentAttempts: {
    id: string;
    testTitle: string;
    correctCount: number | null;
    totalQuestions: number;
    submittedAt: string | null;
  }[];
}
