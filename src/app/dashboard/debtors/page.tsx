"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, PhoneCall, Users2, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatCard } from "@/components/shared/stat-card";
import { paymentsService } from "@/services/payments.service";

function formatSum(value: number) {
  return value.toLocaleString("uz-UZ");
}

export default function DebtorsPage() {
  const debtorsQuery = useQuery({
    queryKey: ["debtors"],
    queryFn: () => paymentsService.debtors(),
  });

  const rows = debtorsQuery.data ?? [];
  const totalDebt = rows.reduce((sum, row) => sum + row.debt, 0);

  return (
    <div className="space-y-6">
      <PageHero
        title="Qarzdorlar"
        subtitle="Shu oy uchun to'lovi to'liq amalga oshmagan o'quvchilar ro'yxati"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users2} label="Qarzdorlar soni" value={rows.length} color="orange" />
        <StatCard icon={Wallet} label="Jami qarz" value={`${formatSum(totalDebt)} so'm`} color="blue" />
        <StatCard icon={AlertCircle} label="Bu oy uchun" value="Kalendar oyi" color="violet" />
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>F.I.Sh</TableHead>
              <TableHead>Guruh</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Kutilgan</TableHead>
              <TableHead>To&apos;langan</TableHead>
              <TableHead>Qarz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtorsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {!debtorsQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={PhoneCall}
                    title="Qarzdorlar yo'q"
                    subtitle="Bu oy uchun barcha faol o'quvchilar to'lovni amalga oshirgan"
                  />
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.student.id}>
                <TableCell className="font-mono text-xs">{row.student.studentCode}</TableCell>
                <TableCell>{row.student.fullName}</TableCell>
                <TableCell>{row.group?.name ?? "—"}</TableCell>
                <TableCell>{row.student.parentPhone ?? row.student.phone ?? "—"}</TableCell>
                <TableCell>{formatSum(row.expected)} so&apos;m</TableCell>
                <TableCell>{formatSum(row.paid)} so&apos;m</TableCell>
                <TableCell className="font-semibold text-destructive">
                  {formatSum(row.debt)} so&apos;m
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
