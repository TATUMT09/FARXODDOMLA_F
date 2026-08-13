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

export default function EmployeesPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesService.list({ limit: 50 }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Xodimlar</h1>
          <p className="text-sm text-muted-foreground">
            Jami {employeesQuery.data?.meta.total ?? 0} ta xodim
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Xodim qo&apos;shish</Button>} />
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
      </div>

      <div className="rounded-md border bg-background">
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
            {employeesQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Hozircha xodimlar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {employeesQuery.data?.data.map((employee) => (
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
      </div>
    </div>
  );
}
