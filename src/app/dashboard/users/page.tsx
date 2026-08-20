"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  KeyRoundIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserCog,
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
import { rolesService } from "@/services/roles.service";
import { usersService } from "@/services/users.service";
import type { CreateSystemUserDto } from "@/types/user";

const userSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().min(5, "Telefon kiriting"),
  login: z.string().optional().or(z.literal("")),
  email: z.string().email("To'g'ri email kiriting").optional().or(z.literal("")),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  roleId: z.string().min(1, "Rolni tanlang"),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => usersService.list({ page, limit: 10, search: search || undefined }),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.list(),
  });

  const roleFilterOptions = useMemo(
    () => [
      { value: "ALL", label: "Barcha rollar" },
      ...(rolesQuery.data?.map((r) => ({ value: r.id, label: r.name })) ?? []),
    ],
    [rolesQuery.data],
  );

  const rows = useMemo(() => {
    const data = usersQuery.data?.data ?? [];
    return roleFilter === "ALL"
      ? data
      : data.filter((u) => u.roleId === roleFilter);
  }, [usersQuery.data, roleFilter]);

  const stats = useMemo(() => {
    const data = usersQuery.data?.data ?? [];
    return {
      active: data.filter((u) => u.status === "ACTIVE").length,
      roles: new Set(data.map((u) => u.roleId)).size,
      withLogin: data.filter((u) => u.login).length,
    };
  }, [usersQuery.data]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { fullName: "", phone: "", login: "", email: "", password: "", roleId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateSystemUserDto) => usersService.create(dto),
    onSuccess: () => {
      toast.success("Foydalanuvchi qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

  const onSubmit = (values: UserFormValues) => {
    createMutation.mutate({
      fullName: values.fullName,
      phone: values.phone,
      login: values.login || undefined,
      email: values.email || undefined,
      password: values.password,
      roleId: values.roleId,
    });
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Foydalanuvchilar"
        subtitle={`Jami ${usersQuery.data?.meta.total ?? 0} ta foydalanuvchi`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="bg-white text-primary hover:bg-white/90">
                  <PlusIcon />
                  Foydalanuvchi qo&apos;shish
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi foydalanuvchi</DialogTitle>
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
                  <Label htmlFor="login">Login (ixtiyoriy)</Label>
                  <Input id="login" {...register("login")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (ixtiyoriy, parolni tiklash uchun)</Label>
                  <Input id="email" type="email" placeholder="email@example.com" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Parol</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={watch("roleId")}
                    onValueChange={(value) => setValue("roleId", value ?? "")}
                    items={rolesQuery.data?.map((role) => ({
                      value: role.id,
                      label: role.name,
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rolni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesQuery.data?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.roleId && (
                    <p className="text-sm text-destructive">{errors.roleId.message}</p>
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
        <StatCard icon={UserCog} label="Jami foydalanuvchilar" value={usersQuery.data?.meta.total ?? 0} color="violet" />
        <StatCard icon={UserCheckIcon} label="Faol foydalanuvchilar" value={stats.active} color="green" />
        <StatCard icon={ShieldCheckIcon} label="Rollar soni" value={stats.roles} color="orange" />
        <StatCard icon={KeyRoundIcon} label="Login bilan" value={stats.withLogin} color="blue" />
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
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value ?? "ALL")}
            items={roleFilterOptions}
          >
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleFilterOptions.map((item) => (
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
              <TableHead>Login</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {!usersQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={UserCog}
                    title="Hozircha foydalanuvchilar yo'q"
                    subtitle="Birinchi foydalanuvchini qo'shib boshlang"
                  />
                </TableCell>
              </TableRow>
            )}
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.login ?? "—"}</TableCell>
                <TableCell>{user.email ?? "—"}</TableCell>
                <TableCell>{user.role?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {usersQuery.data && usersQuery.data.meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={usersQuery.data.meta.totalPages}
            total={usersQuery.data.meta.total}
            itemLabel="foydalanuvchi"
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
