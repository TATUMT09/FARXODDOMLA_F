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
import { coursesService } from "@/services/courses.service";
import { teachersService } from "@/services/teachers.service";
import { groupsService } from "@/services/groups.service";
import type { CreateGroupDto } from "@/types/group";

const groupSchema = z.object({
  name: z.string().min(2, "Guruh nomini kiriting"),
  courseId: z.string().min(1, "Kursni tanlang"),
  teacherId: z.string().optional(),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function GroupsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsService.list({ limit: 50 }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesService.list({ limit: 100 }),
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teachersService.list({ limit: 100 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", courseId: "", teacherId: "", branchId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateGroupDto) => groupsService.create(dto),
    onSuccess: () => {
      toast.success("Guruh qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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

  const onSubmit = (values: GroupFormValues) => {
    createMutation.mutate({
      name: values.name,
      courseId: values.courseId,
      teacherId: values.teacherId || undefined,
      branchId: values.branchId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Guruhlar</h1>
          <p className="text-sm text-muted-foreground">
            Jami {groupsQuery.data?.meta.total ?? 0} ta guruh
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Guruh qo&apos;shish</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi guruh</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Guruh nomi</Label>
                <Input id="name" placeholder="IELTS-101" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Kurs</Label>
                <Select
                  value={watch("courseId")}
                  onValueChange={(value) => setValue("courseId", value ?? "")}
                  items={coursesQuery.data?.data.map((course) => ({
                    value: course.id,
                    label: course.name,
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kursni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesQuery.data?.data.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-sm text-destructive">{errors.courseId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>O&apos;qituvchi</Label>
                <Select
                  value={watch("teacherId")}
                  onValueChange={(value) => setValue("teacherId", value ?? undefined)}
                  items={teachersQuery.data?.data.map((teacher) => ({
                    value: teacher.id,
                    label: teacher.fullName,
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="O'qituvchini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersQuery.data?.data.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <TableHead>Nomi</TableHead>
              <TableHead>Kurs</TableHead>
              <TableHead>O&apos;qituvchi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {groupsQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Hozircha guruhlar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {groupsQuery.data?.data.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.course?.name ?? "—"}</TableCell>
                <TableCell>{group.teacher?.fullName ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{group.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
