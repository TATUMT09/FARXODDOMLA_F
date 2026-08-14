"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  BookMarkedIcon,
  GraduationCap,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  UserXIcon,
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
import { teachersService } from "@/services/teachers.service";
import type { CreateTeacherDto } from "@/types/teacher";

const teacherSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().min(5, "Telefon kiriting"),
  specialty: z.string().optional().or(z.literal("")),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

const STATUS_FILTERS = [
  { value: "ALL", label: "Barcha statuslar" },
  { value: "ACTIVE", label: "Faol" },
  { value: "INACTIVE", label: "Nofaol" },
];

export default function TeachersPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const teachersQuery = useQuery({
    queryKey: ["teachers", page, search],
    queryFn: () => teachersService.list({ page, limit: 10, search: search || undefined }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

  const rows = useMemo(() => {
    const data = teachersQuery.data?.data ?? [];
    return statusFilter === "ALL"
      ? data
      : data.filter((t) => t.status === statusFilter);
  }, [teachersQuery.data, statusFilter]);

  const stats = useMemo(() => {
    const data = teachersQuery.data?.data ?? [];
    return {
      active: data.filter((t) => t.status === "ACTIVE").length,
      inactive: data.filter((t) => t.status === "INACTIVE").length,
      specialties: new Set(data.map((t) => t.specialty).filter(Boolean)).size,
    };
  }, [teachersQuery.data]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { fullName: "", phone: "", specialty: "", branchId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTeacherDto) => teachersService.create(dto),
    onSuccess: () => {
      toast.success("O'qituvchi qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
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

  const onSubmit = (values: TeacherFormValues) => {
    createMutation.mutate({
      fullName: values.fullName,
      phone: values.phone,
      specialty: values.specialty || undefined,
      branchId: values.branchId,
    });
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="O'qituvchilar"
        subtitle={`Jami ${teachersQuery.data?.meta.total ?? 0} ta o'qituvchi`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="bg-white text-primary hover:bg-white/90">
                  <PlusIcon />
                  O&apos;qituvchi qo&apos;shish
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi o&apos;qituvchi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">F.I.Sh</Label>
                  <Input id="fullName" {...register("fullName")} />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="+998901234567" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Mutaxassisligi</Label>
                  <Input id="specialty" placeholder="IELTS" {...register("specialty")} />
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
                    <p className="text-sm text-destructive">{errors.branchId.message}</p>
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
        <StatCard icon={GraduationCap} label="Jami o'qituvchilar" value={teachersQuery.data?.meta.total ?? 0} color="violet" />
        <StatCard icon={UserCheckIcon} label="Faol o'qituvchilar" value={stats.active} color="green" />
        <StatCard icon={UserXIcon} label="Nofaol" value={stats.inactive} color="orange" />
        <StatCard icon={BookMarkedIcon} label="Mutaxassisliklar" value={stats.specialties} color="blue" />
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
              <TableHead>F.I.Sh</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Mutaxassislik</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {!teachersQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    icon={GraduationCap}
                    title="Hozircha o'qituvchilar yo'q"
                    subtitle="Birinchi o'qituvchini qo'shib boshlang"
                  />
                </TableCell>
              </TableRow>
            )}
            {rows.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.fullName}</TableCell>
                <TableCell>{teacher.phone}</TableCell>
                <TableCell>{teacher.specialty ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{teacher.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {teachersQuery.data && teachersQuery.data.meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={teachersQuery.data.meta.totalPages}
            total={teachersQuery.data.meta.total}
            itemLabel="o'qituvchi"
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
