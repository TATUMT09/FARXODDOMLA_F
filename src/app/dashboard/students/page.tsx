"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  AlertCircle,
  ClockIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { branchesService } from "@/services/branches.service";
import { studentsService } from "@/services/students.service";
import type { CreateStudentDto } from "@/types/student";

const studentSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().optional().or(z.literal("")),
  parentPhone: z.string().optional().or(z.literal("")),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const STATUS_FILTERS = [
  { value: "ALL", label: "Barcha statuslar" },
  { value: "ACTIVE", label: "Faol" },
  { value: "TRIAL", label: "Sinov muddatida" },
  { value: "PAUSED", label: "Vaqtincha to'xtatilgan" },
  { value: "DEBTOR", label: "Qarzdor" },
  { value: "GRADUATED", label: "Bitirgan" },
  { value: "LEFT", label: "Ketgan" },
  { value: "BLOCKED", label: "Bloklangan" },
];

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ["students", page, search],
    queryFn: () => studentsService.list({ page, limit: 10, search: search || undefined }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

  const rows = useMemo(() => {
    const data = studentsQuery.data?.data ?? [];
    return statusFilter === "ALL"
      ? data
      : data.filter((s) => s.status === statusFilter);
  }, [studentsQuery.data, statusFilter]);

  const stats = useMemo(() => {
    const data = studentsQuery.data?.data ?? [];
    return {
      active: data.filter((s) => s.status === "ACTIVE").length,
      trial: data.filter((s) => s.status === "TRIAL").length,
      debtor: data.filter((s) => s.status === "DEBTOR").length,
    };
  }, [studentsQuery.data]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: "", phone: "", parentPhone: "", branchId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateStudentDto) => studentsService.create(dto),
    onSuccess: () => {
      toast.success("O'quvchi qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      reset();
      setOpen(false);
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : undefined;
      toast.error(message ?? "Xatolik yuz berdi");
    },
  });

  const onSubmit = (values: StudentFormValues) => {
    createMutation.mutate({
      fullName: values.fullName,
      phone: values.phone || undefined,
      parentPhone: values.parentPhone || undefined,
      branchId: values.branchId,
    });
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="O'quvchilar"
        subtitle={`Jami ${studentsQuery.data?.meta.total ?? 0} ta o'quvchi`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="bg-white text-primary hover:bg-white/90">
                  <PlusIcon />
                  O&apos;quvchi qo&apos;shish
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi o&apos;quvchi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">F.I.Sh</Label>
                  <Input id="fullName" {...register("fullName")} />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="+998901234567" {...register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Ota-ona telefoni</Label>
                  <Input id="parentPhone" placeholder="+998901234567" {...register("parentPhone")} />
                </div>
                <div className="space-y-2">
                  <Label>Filial</Label>
                  <Select
                    value={watch("branchId")}
                    onValueChange={(value) => setValue("branchId", value ?? "")}
                    items={branchesQuery.data?.map((branch) => ({
                      value: branch.id,
                      label: branch.name,
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filialni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchesQuery.data?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.branchId && (
                    <p className="text-sm text-destructive">
                      {errors.branchId.message}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    Saqlash
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Jami o'quvchilar" value={studentsQuery.data?.meta.total ?? 0} color="violet" />
        <StatCard icon={UserCheckIcon} label="Faol o'quvchilar" value={stats.active} color="green" />
        <StatCard icon={ClockIcon} label="Sinov muddatida" value={stats.trial} color="orange" />
        <StatCard icon={AlertCircle} label="Qarzdorlar" value={stats.debtor} color="blue" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Qidirish..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "ALL")}
            items={STATUS_FILTERS}
          >
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>F.I.Sh</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {!studentsQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    icon={Users}
                    title="Hozircha o'quvchilar yo'q"
                    subtitle="Birinchi o'quvchini qo'shib boshlang"
                  />
                </TableCell>
              </TableRow>
            )}
            {rows.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-mono text-xs">
                  {student.studentCode}
                </TableCell>
                <TableCell>{student.fullName}</TableCell>
                <TableCell>{student.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{student.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {studentsQuery.data && studentsQuery.data.meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={studentsQuery.data.meta.totalPages}
            total={studentsQuery.data.meta.total}
            itemLabel="o'quvchi"
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
