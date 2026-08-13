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
import { studentsService } from "@/services/students.service";
import type { CreateStudentDto } from "@/types/student";

const studentSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().optional().or(z.literal("")),
  parentPhone: z.string().optional().or(z.literal("")),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => studentsService.list({ limit: 50 }),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">O&apos;quvchilar</h1>
          <p className="text-sm text-muted-foreground">
            Jami {studentsQuery.data?.meta.total ?? 0} ta o&apos;quvchi
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>O&apos;quvchi qo&apos;shish</Button>} />
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
      </div>

      <div className="rounded-md border bg-background">
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
            {studentsQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Hozircha o&apos;quvchilar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {studentsQuery.data?.data.map((student) => (
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
      </div>
    </div>
  );
}
