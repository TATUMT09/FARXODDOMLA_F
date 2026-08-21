"use client";

import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestsNav } from "@/components/tests/tests-nav";
import { cn } from "@/lib/utils";
import { publicTestsService } from "@/services/public-tests.service";
import type { QuestionOption } from "@/types/test";
import type { StartTestResponse } from "@/types/public-test";

const OPTIONS: { key: QuestionOption; label: "optionA" | "optionB" | "optionC" | "optionD" }[] = [
  { key: "A", label: "optionA" },
  { key: "B", label: "optionB" },
  { key: "C", label: "optionC" },
  { key: "D", label: "optionD" },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.max(0, Math.floor(totalSeconds / 60));
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<StartTestResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuestionOption>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    publicTestsService
      .start(params.id)
      .then((res) => {
        if (cancelled) return;
        setSession(res);
        const deadline = new Date(res.startedAt).getTime() + res.durationMinutes * 60000;
        setRemainingSeconds(Math.round((deadline - Date.now()) / 1000));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AxiosError && err.response?.status === 401) {
          router.push("/tests/login");
          return;
        }
        const message =
          err instanceof AxiosError
            ? (err.response?.data as { message?: string })?.message
            : undefined;
        setError(message ?? "Testni boshlab bo'lmadi");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSubmit = useCallback(async () => {
    if (!session || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await publicTestsService.submit(
        session.attemptId,
        Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      );
      router.push(`/tests/attempts/${session.attemptId}`);
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
      setError("Topshirishda xatolik yuz berdi, qayta urinib ko'ring");
    }
  }, [session, answers, router]);

  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      void handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev === null ? null : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds, handleSubmit]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (error) {
    return (
      <div className="min-h-screen bg-sky-50">
        <TestsNav />
        <div className="mx-auto max-w-2xl p-6 text-center text-destructive">{error}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-sky-50">
        <TestsNav />
        <div className="mx-auto max-w-2xl p-6 text-center text-muted-foreground">
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      <TestsNav />
      <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary via-primary to-fuchsia-600 px-6 py-4 text-primary-foreground shadow-sm">
          <div>
            <h1 className="text-lg font-bold">{session.title}</h1>
            <p className="text-sm text-primary-foreground/80">
              {answeredCount} / {session.questions.length} javob berildi
            </p>
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {remainingSeconds !== null ? formatTime(remainingSeconds) : "--:--"}
          </div>
        </div>

        {session.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {index + 1}. {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OPTIONS.map((opt) => {
                const selected = answers[question.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: opt.key }))
                    }
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {opt.key}
                    </span>
                    {question[opt.label]}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <Button
          className="w-full"
          size="lg"
          disabled={submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? "Yuborilmoqda..." : "Yakunlash"}
        </Button>
      </div>
    </div>
  );
}
