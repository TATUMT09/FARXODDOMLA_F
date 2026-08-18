"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { StatCard } from "@/components/shared/stat-card";
import { reportsService } from "@/services/reports.service";

function formatSum(value: number) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

export default function DashboardPage() {
  const overviewQuery = useQuery({
    queryKey: ["reports-overview"],
    queryFn: () => reportsService.overview(),
  });
  const data = overviewQuery.data;

  const stats = [
    { icon: Users, label: "Jami o'quvchilar", value: data?.students.total ?? "—", color: "violet" as const },
    { icon: UserCheck, label: "Faol o'quvchilar", value: data?.students.active ?? "—", color: "green" as const },
    { icon: Wallet, label: "Bugungi kirim", value: data ? formatSum(data.finance.todayIncome) : "—", color: "orange" as const },
    { icon: AlertCircle, label: "Qarzdorlar", value: data?.payments.debtorsCount ?? "—", color: "blue" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHero
        title="Bosh sahifa"
        subtitle="Markazning bugungi holati bir nazarda"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
}
