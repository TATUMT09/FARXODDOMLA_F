"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestsNav } from "@/components/tests/tests-nav";
import { cn } from "@/lib/utils";
import { publicTestsService } from "@/services/public-tests.service";

const OPTIONS = [
  { key: "A", label: "optionA" },
  { key: "B", label: "optionB" },
  { key: "C", label: "optionC" },
  { key: "D", label: "optionD" },
] as const;

export default function AttemptResultPage() {
  const params = useParams<{ id: string }>();

  const attemptQuery = useQuery({
    queryKey: ["test-attempt", params.id],
    queryFn: () => publicTestsService.getAttempt(params.id),
  });

  const attempt = attemptQuery.data;

  return (
    <div className="min-h-screen bg-sky-50">
      <TestsNav />
      <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
        {attemptQuery.isLoading && (
          <p className="text-center text-muted-foreground">Yuklanmoqda...</p>
        )}

        {attempt && (
          <>
            <div className="rounded-2xl bg-gradient-to-r from-primary via-primary to-fuchsia-600 px-6 py-8 text-center text-primary-foreground shadow-sm">
              <h1 className="text-lg font-semibold">{attempt.test.title}</h1>
              <p className="mt-2 text-4xl font-bold">
                {attempt.correctCount} / {attempt.totalQuestions}
              </p>
              <p className="mt-1 text-primary-foreground/80">to&apos;g&apos;ri javob</p>
            </div>

            {attempt.answers.map((answer, index) => (
              <Card key={answer.questionId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {answer.isCorrect ? (
                      <CheckCircle2Icon className="size-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="size-5 text-destructive" />
                    )}
                    {index + 1}. {answer.question.text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {OPTIONS.map((opt) => {
                    const isCorrectOption = answer.question.correctOption === opt.key;
                    const isSelected = answer.selectedOption === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                          isCorrectOption &&
                            "border-green-600 bg-green-50 text-green-700",
                          isSelected &&
                            !isCorrectOption &&
                            "border-destructive bg-destructive/10 text-destructive",
                        )}
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                          {opt.key}
                        </span>
                        {answer.question[opt.label]}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" render={<Link href="/tests">Testlar ro&apos;yxati</Link>} nativeButton={false} />
              <Button className="flex-1" render={<Link href="/tests/profile">Statistikam</Link>} nativeButton={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
