"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { CheckCircle2, Inbox, MailPlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatCard } from "@/components/shared/stat-card";
import { admissionsService } from "@/services/admissions.service";
import { branchesService } from "@/services/branches.service";
import type { AdmissionStatus } from "@/types/admission";

const STATUS_OPTIONS: { value: AdmissionStatus; label: string }[] = [
  { value: "NEW", label: "Yangi" },
  { value: "CONTACTED", label: "Bog'lanildi" },
  { value: "TRIAL", label: "Sinov darsida" },
  { value: "ENROLLED", label: "Ro'yxatdan o'tdi" },
  { value: "REJECTED", label: "Rad etildi" },
  { value: "CANCELLED", label: "Bekor qilindi" },
];

const STATUS_VARIANT: Record<AdmissionStatus, "secondary" | "destructive"> = {
  NEW: "secondary",
  CONTACTED: "secondary",
  TRIAL: "secondary",
  ENROLLED: "secondary",
  REJECTED: "destructive",
  CANCELLED: "destructive",
};

export default function AdmissionsPage() {
  const [branchByAdmission, setBranchByAdmission] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const admissionsQuery = useQuery({
    queryKey: ["admissions"],
    queryFn: () => admissionsService.list({ limit: 50 }),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admissions"] });

  const onError = (error: unknown) => {
    const message =
      error instanceof AxiosError
        ? (error.response?.data as { message?: string })?.message
        : undefined;
    toast.error(message ?? "Xatolik yuz berdi");
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdmissionStatus }) =>
      admissionsService.update(id, { status }),
    onSuccess: () => {
      toast.success("Status yangilandi");
      invalidate();
    },
    onError,
  });

  const convertMutation = useMutation({
    mutationFn: ({ id, branchId }: { id: string; branchId: string }) =>
      admissionsService.convert(id, branchId),
    onSuccess: () => {
      toast.success("O'quvchiga aylantirildi");
      invalidate();
    },
    onError,
  });

  const rows = admissionsQuery.data?.data ?? [];
  const newCount = rows.filter((r) => r.status === "NEW").length;
  const trialCount = rows.filter((r) => r.status === "TRIAL").length;
  const enrolledCount = rows.filter((r) => r.status === "ENROLLED").length;

  return (
    <div className="space-y-6">
      <PageHero
        title="Online qabul"
        subtitle="Saytdan tushgan arizalarni ko'rib chiqing va o'quvchiga aylantiring"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Jami arizalar" value={admissionsQuery.data?.meta.total ?? 0} color="violet" />
        <StatCard icon={MailPlus} label="Yangi" value={newCount} color="orange" />
        <StatCard icon={CheckCircle2} label="Sinov darsida" value={trialCount} color="blue" />
        <StatCard icon={UserPlus} label="Ro'yxatdan o'tgan" value={enrolledCount} color="green" />
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>F.I.Sh</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Qiziqish</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!admissionsQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Inbox}
                    title="Hozircha arizalar yo'q"
                    subtitle="Saytdan yangi ariza tushganda shu yerda ko'rinadi"
                  />
                </TableCell>
              </TableRow>
            )}
            {rows.map((admission) => (
              <TableRow key={admission.id}>
                <TableCell>{admission.fullName}</TableCell>
                <TableCell>{admission.phone}</TableCell>
                <TableCell>{admission.courseInterest ?? "—"}</TableCell>
                <TableCell>{new Date(admission.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                <TableCell>
                  <Select
                    value={admission.status}
                    onValueChange={(value) =>
                      value &&
                      statusMutation.mutate({ id: admission.id, status: value as AdmissionStatus })
                    }
                    items={STATUS_OPTIONS}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant={STATUS_VARIANT[admission.status]} className="mt-1">
                    {STATUS_OPTIONS.find((s) => s.value === admission.status)?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!admission.convertedStudentId ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={branchByAdmission[admission.id] ?? ""}
                        onValueChange={(value) =>
                          setBranchByAdmission((prev) => ({ ...prev, [admission.id]: value ?? "" }))
                        }
                        items={branchesQuery.data?.map((b) => ({ value: b.id, label: b.name }))}
                      >
                        <SelectTrigger size="sm" className="w-32">
                          <SelectValue placeholder="Filial" />
                        </SelectTrigger>
                        <SelectContent>
                          {branchesQuery.data?.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={!branchByAdmission[admission.id] || convertMutation.isPending}
                        onClick={() =>
                          convertMutation.mutate({
                            id: admission.id,
                            branchId: branchByAdmission[admission.id],
                          })
                        }
                      >
                        O&apos;quvchiga aylantirish
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary">O&apos;quvchi bo&apos;ldi</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
