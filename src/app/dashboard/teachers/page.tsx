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
import { teachersService } from "@/services/teachers.service";
import type { CreateTeacherDto } from "@/types/teacher";

const teacherSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().min(5, "Telefon kiriting"),
  specialty: z.string().optional().or(z.literal("")),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

export default function TeachersPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teachersService.list({ limit: 50 }),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">O&apos;qituvchilar</h1>
          <p className="text-sm text-muted-foreground">
            Jami {teachersQuery.data?.meta.total ?? 0} ta o&apos;qituvchi
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>O&apos;qituvchi qo&apos;shish</Button>} />
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
      </div>

      <div className="rounded-md border bg-background">
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
            {teachersQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Hozircha o&apos;qituvchilar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {teachersQuery.data?.data.map((teacher) => (
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
      </div>
    </div>
  );
}
