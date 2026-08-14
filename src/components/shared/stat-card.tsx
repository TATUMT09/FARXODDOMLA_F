import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatColor = "violet" | "green" | "orange" | "blue";

const COLOR_CLASSES: Record<StatColor, string> = {
  violet: "bg-violet-100 text-violet-600",
  green: "bg-emerald-100 text-emerald-600",
  orange: "bg-orange-100 text-orange-600",
  blue: "bg-blue-100 text-blue-600",
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: StatColor;
}

export function StatCard({ icon: Icon, label, value, color = "violet" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3.5">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            COLOR_CLASSES[color],
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold leading-tight">{value}</div>
          <div className="truncate text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
