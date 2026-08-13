import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PLACEHOLDER_STATS = [
  { label: "Jami o'quvchilar", value: "—" },
  { label: "Bugun kelganlar", value: "—" },
  { label: "Bugungi kirim", value: "—" },
  { label: "Qarzdorlar", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bosh sahifa</h1>
        <p className="text-sm text-muted-foreground">
          Davomat, to&apos;lov va moliya statistikasi keyingi bosqichlarda shu yerda ko&apos;rinadi.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEHOLDER_STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
