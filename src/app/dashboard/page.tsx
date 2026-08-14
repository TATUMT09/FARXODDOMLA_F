import {
  AlertCircle,
  CalendarCheck,
  Users,
  Wallet,
} from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { StatCard } from "@/components/shared/stat-card";

const PLACEHOLDER_STATS = [
  { icon: Users, label: "Jami o'quvchilar", value: "—", color: "violet" as const },
  { icon: CalendarCheck, label: "Bugun kelganlar", value: "—", color: "green" as const },
  { icon: Wallet, label: "Bugungi kirim", value: "—", color: "orange" as const },
  { icon: AlertCircle, label: "Qarzdorlar", value: "—", color: "blue" as const },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="Bosh sahifa"
        subtitle="Davomat, to'lov va moliya statistikasi keyingi bosqichlarda shu yerda ko'rinadi."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEHOLDER_STATS.map((stat) => (
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
