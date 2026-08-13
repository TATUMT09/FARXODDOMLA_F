"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { rolesService } from "@/services/roles.service";
import { usersService } from "@/services/users.service";
import type { CreateSystemUserDto } from "@/types/user";

const userSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().min(5, "Telefon kiriting"),
  login: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  roleId: z.string().min(1, "Rolni tanlang"),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => usersService.list({ limit: 50 }),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.list(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { fullName: "", phone: "", login: "", password: "", roleId: "" },
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
      password: values.password,
      roleId: values.roleId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
          <p className="text-sm text-muted-foreground">
            Jami {usersQuery.data?.meta.total ?? 0} ta foydalanuvchi
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Foydalanuvchi qo&apos;shish</Button>} />
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
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>F.I.Sh</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {usersQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Hozircha foydalanuvchilar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {usersQuery.data?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.login ?? "—"}</TableCell>
                <TableCell>{user.role?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
