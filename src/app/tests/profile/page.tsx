"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle2Icon, ClipboardListIcon, PercentIcon, TargetIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TestsNav } from "@/components/tests/tests-nav";
import { publicTestsService } from "@/services/public-tests.service";

export default function TestsProfilePage() {
  const statsQuery = useQuery({
    queryKey: ["test-stats-me"],
    queryFn: () => publicTestsService.statsMe(),
  });

  const stats = statsQuery.data;

  return (
    <div className="min-h-screen bg-sky-50">
      <TestsNav />
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        <div className="rounded-2xl bg-orange-500 px-6 py-8 text-white shadow-sm">
          <h1 className="text-2xl font-bold">Mening statistikam</h1>
          <p className="mt-1 text-white/80">Test natijalaringiz va yutuqlaringiz</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ClipboardListIcon} label="Topshirilgan testlar" value={stats?.testsTaken ?? 0} color="orange" />
          <StatCard icon={TargetIcon} label="Yechilgan misollar" value={stats?.totalQuestionsAnswered ?? 0} color="orange" />
          <StatCard icon={CheckCircle2Icon} label="To'g'ri javoblar" value={stats?.totalCorrect ?? 0} color="orange" />
          <StatCard icon={PercentIcon} label="Aniqlik" value={`${stats?.accuracyPercent ?? 0}%`} color="orange" />
        </div>

        <Card className="overflow-hidden py-0">
          <CardHeader className="pt-6">
            <CardTitle>So&apos;nggi urinishlar</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Natija</TableHead>
                <TableHead>Sana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statsQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              )}
              {!statsQuery.isLoading && (stats?.recentAttempts.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <EmptyState
                      icon={ClipboardListIcon}
                      title="Hali test topshirilmagan"
                      subtitle="Birinchi testingizni boshlang"
                    />
                  </TableCell>
                </TableRow>
              )}
              {stats?.recentAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>
                    <Link
                      href={`/tests/attempts/${attempt.id}`}
                      className="text-orange-600 hover:underline"
                    >
                      {attempt.testTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {attempt.correctCount} / {attempt.totalQuestions}
                  </TableCell>
                  <TableCell>
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleString("uz-UZ")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
