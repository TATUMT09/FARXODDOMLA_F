"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserX,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatCard } from "@/components/shared/stat-card";
import { attendanceService } from "@/services/attendance.service";
import { groupsService } from "@/services/groups.service";
import type { AttendanceStatus } from "@/types/attendance";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Keldi" },
  { value: "LATE", label: "Kechikdi" },
  { value: "ABSENT", label: "Kelmadi" },
  { value: "EXCUSED", label: "Sababli" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [groupId, setGroupId] = useState<string>("");
  const [date, setDate] = useState(todayIso());
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ["groups-for-attendance"],
    queryFn: () => groupsService.list({ limit: 100 }),
  });

  const rosterQuery = useQuery({
    queryKey: ["attendance-roster", groupId, date],
    queryFn: () => attendanceService.getRoster(groupId, date),
    enabled: !!groupId && !!date,
  });

  useEffect(() => {
    if (!rosterQuery.data) return;
    const next: Record<string, AttendanceStatus> = {};
    for (const student of rosterQuery.data.students) {
      if (student.status) next[student.id] = student.status;
    }
    setRecords(next);
  }, [rosterQuery.data]);

  const markMutation = useMutation({
    mutationFn: () =>
      attendanceService.mark({
        groupId,
        date,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      }),
    onSuccess: () => {
      toast.success("Davomat saqlandi");
      queryClient.invalidateQueries({ queryKey: ["attendance-roster"] });
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : undefined;
      toast.error(message ?? "Xatolik yuz berdi");
    },
  });

  const stats = useMemo(() => {
    const students = rosterQuery.data?.students ?? [];
    const values = students.map((s) => records[s.id]);
    return {
      total: students.length,
      present: values.filter((v) => v === "PRESENT").length,
      late: values.filter((v) => v === "LATE").length,
      absent: values.filter((v) => v === "ABSENT").length,
    };
  }, [rosterQuery.data, records]);

  return (
    <div className="space-y-6">
      <PageHero
        title="Davomat"
        subtitle="Guruh va sanani tanlab, o'quvchilar davomatini belgilang"
      />

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Guruh</Label>
            <Select
              value={groupId}
              onValueChange={(value) => setGroupId(value ?? "")}
              items={groupsQuery.data?.data.map((group) => ({
                value: group.id,
                label: group.name,
              }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Guruhni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {groupsQuery.data?.data.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:w-56">
            <Label htmlFor="date">Sana</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {groupId && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Jami o'quvchi" value={stats.total} color="violet" />
            <StatCard icon={CheckCircle2} label="Keldi" value={stats.present} color="green" />
            <StatCard icon={Clock} label="Kechikdi" value={stats.late} color="orange" />
            <StatCard icon={UserX} label="Kelmadi" value={stats.absent} color="blue" />
          </div>

          <Card className="py-0">
            <CardContent className="space-y-1 py-4">
              {rosterQuery.isLoading && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Yuklanmoqda...
                </p>
              )}
              {!rosterQuery.isLoading && rosterQuery.data?.students.length === 0 && (
                <EmptyState
                  icon={CalendarCheck}
                  title="Guruhda o'quvchi yo'q"
                  subtitle="Bu guruhga hali o'quvchi biriktirilmagan"
                />
              )}
              {rosterQuery.data?.students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col gap-3 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{student.fullName}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {student.studentCode}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={records[student.id] === option.value ? "default" : "outline"}
                        onClick={() =>
                          setRecords((prev) => ({ ...prev, [student.id]: option.value }))
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {(rosterQuery.data?.students.length ?? 0) > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={() => markMutation.mutate()}
                disabled={markMutation.isPending || Object.keys(records).length === 0}
              >
                Saqlash
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
