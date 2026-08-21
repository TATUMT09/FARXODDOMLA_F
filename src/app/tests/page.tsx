"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ClipboardListIcon, ClockIcon, HelpCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { TestsNav } from "@/components/tests/tests-nav";
import { useTestTakerAuth } from "@/providers/test-taker-auth-provider";
import { publicTestsService } from "@/services/public-tests.service";

export default function PublicTestsPage() {
  const router = useRouter();
  const { status } = useTestTakerAuth();

  const testsQuery = useQuery({
    queryKey: ["public-tests"],
    queryFn: () => publicTestsService.list(),
  });

  const handleStart = (testId: string) => {
    if (status !== "authenticated") {
      router.push("/tests/login");
      return;
    }
    router.push(`/tests/${testId}`);
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <TestsNav />
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <PageHero
          title="Ochiq testlar"
          subtitle="Bilimingizni sinab ko'ring, natijalaringizni kuzating"
        />

        {testsQuery.isLoading && (
          <p className="text-center text-muted-foreground">Yuklanmoqda...</p>
        )}

        {!testsQuery.isLoading && (testsQuery.data?.length ?? 0) === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                icon={ClipboardListIcon}
                title="Hozircha testlar yo'q"
                subtitle="Tez orada yangi testlar qo'shiladi"
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testsQuery.data?.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle>{test.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {test.description && (
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="size-4" />
                    {test.durationMinutes} daqiqa
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HelpCircleIcon className="size-4" />
                    {test.questionCount} savol
                  </span>
                </div>
                <Button className="w-full" onClick={() => handleStart(test.id)}>
                  Boshlash
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
