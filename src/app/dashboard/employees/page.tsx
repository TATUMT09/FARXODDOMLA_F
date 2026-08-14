"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  BriefcaseIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  UserXIcon,
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
import { employeesService } from "@/services/employees.service";
import type { CreateEmployeeDto } from "@/types/employee";

const employeeSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().min(5, "Telefon kiriting"),
  position: z.string().min(2, "Lavozimni kiriting"),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const STATUS_FILTERS = [
  { value: "ALL", label: "Barcha statuslar" },
  { value: "ACTIVE", label: "Faol" },
  { value: "INACTIVE", label: "Nofaol" },
];

export default function EmployeesPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ["employees", page, search],
    queryFn: () => employeesService.list({ page, limit: 10, search: search || undefined }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

  const rows = useMemo(() => {
    const data = employeesQuery.data?.data ?? [];
    return statusFilter === "ALL"
      ? data
      : data.filter((e) => e.status === statusFilter);
  }, [employeesQuery.data, statusFilter]);

  const stats = useMemo(() => {
    const data = employeesQuery.data?.data ?? [];
    return {
      active: data.filter((e) => e.status === "ACTIVE").length,
      inactive: data.filter((e) => e.status === "INACTIVE").length,
      positions: new Set(data.map((e) => e.position)).size,
    };
  }, [employeesQuery.data]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { fullName: "", phone: "", position: "", branchId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateEmployeeDto) => employeesService.create(dto),
    onSuccess: () => {
      toast.success("Xodim qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
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

  const onSubmit = (values: EmployeeFormValues) => {
    createMutation.mutate({
      fullName: values.fullName,
      phone: values.phone,
      position: values.position,
      branchId: values.branchId,
    });
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Xodimlar"
        subtitle={`Jami ${employeesQuery.data?.meta.total ?? 0} ta xodim`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="bg-white text-primary hover:bg-white/90">
                  <PlusIcon />
                  Xodim qo&apos;shish
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi xodim</DialogTitle>
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
                  <Label htmlFor="position">Lavozimi</Label>
                  <Input id="position" placeholder="RECEPTIONIST" {...register("position")} />
                  {errors.position && (
                    <p className="text-sm text-destructive">{errors.position.message}</p>
                  )}
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
        <StatCard icon={Users} label="Jami xodimlar" value={employeesQuery.data?.meta.total ?? 0} color="violet" />
        <StatCard icon={UserCheckIcon} label="Faol xodimlar" value={stats.active} color="green" />
        <StatCard icon={BriefcaseIcon} label="Lavozimlar" value={stats.positions} color="orange" />
        <StatCard icon={UserXIcon} label="Nofaol xodimlar" value={stats.inactive} color="blue" />
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
              <TableHead>Lavozim</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeesQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {!employeesQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    icon={Users}
                    title="Hozircha xodimlar yo'q"
                    subtitle="Birinchi xodimni qo'shib boshlang"
                  />
                </TableCell>
              </TableRow>
            )}
            {rows.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.fullName}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{employee.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {employeesQuery.data && employeesQuery.data.meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={employeesQuery.data.meta.totalPages}
            total={employeesQuery.data.meta.total}
            itemLabel="xodim"
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
