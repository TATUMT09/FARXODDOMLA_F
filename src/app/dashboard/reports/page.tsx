"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  GraduationCap,
  Inbox,
  TrendingUp,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/shared/page-hero";
import { StatCard } from "@/components/shared/stat-card";
import { reportsService } from "@/services/reports.service";

function formatSum(value: number) {
  return value.toLocaleString("uz-UZ");
}

const ATTENDANCE_LABELS: Record<string, string> = {
  PRESENT: "Keldi",
  LATE: "Kechikdi",
  ABSENT: "Kelmadi",
  EXCUSED: "Sababli",
};

export default function ReportsPage() {
  const overviewQuery = useQuery({
    queryKey: ["reports-overview"],
    queryFn: () => reportsService.overview(),
  });

  const data = overviewQuery.data;

  return (
    <div className="space-y-6">
      <PageHero title="Hisobotlar" subtitle="Markazning umumiy holati bir nazarda" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Jami o'quvchilar" value={data?.students.total ?? 0} color="violet" />
        <StatCard icon={UserPlus} label="Bu oy qo'shilgan" value={data?.students.newThisMonth ?? 0} color="green" />
        <StatCard icon={GraduationCap} label="O'qituvchilar" value={data?.teachers ?? 0} color="orange" />
        <StatCard icon={Briefcase} label="Xodimlar" value={data?.employees ?? 0} color="blue" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Kurslar" value={data?.courses ?? 0} color="violet" />
        <StatCard icon={UsersRound} label="Guruhlar" value={data?.groups ?? 0} color="green" />
        <StatCard icon={Inbox} label="Yangi arizalar" value={data?.admissionsNew ?? 0} color="orange" />
        <StatCard icon={TrendingUp} label="Oylik sof foyda" value={`${formatSum(data?.finance.monthNet ?? 0)} so'm`} color="blue" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-4" /> Moliya (shu oy)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kirim</span>
              <span className="font-medium">{formatSum(data?.finance.monthIncome ?? 0)} so&apos;m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chiqim</span>
              <span className="font-medium">{formatSum(data?.finance.monthExpense ?? 0)} so&apos;m</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Sof foyda</span>
              <span className="font-semibold">{formatSum(data?.finance.monthNet ?? 0)} so&apos;m</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Qarzdorlar</span>
              <span className="font-medium">
                {data?.payments.debtorsCount ?? 0} ta ({formatSum(data?.payments.totalDebt ?? 0)} so&apos;m)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="size-4" /> Davomat (shu oy)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.keys(ATTENDANCE_LABELS).map((status) => (
              <div key={status} className="flex justify-between">
                <span className="text-muted-foreground">{ATTENDANCE_LABELS[status]}</span>
                <span className="font-medium">{data?.attendanceThisMonth[status] ?? 0}</span>
              </div>
            ))}
            {data && Object.keys(data.attendanceThisMonth).length === 0 && (
              <p className="text-muted-foreground">Bu oy hali davomat belgilanmagan</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
