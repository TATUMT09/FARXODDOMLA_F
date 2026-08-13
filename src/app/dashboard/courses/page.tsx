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
import type { CreateCourseDto } from "@/types/course";

const courseSchema = z.object({
  name: z.string().min(2, "Kurs nomini kiriting"),
  category: z.string().optional().or(z.literal("")),
  price: z.string().min(1, "Narxni kiriting"),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CoursesPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesService.list({ limit: 50 }),
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
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: "", category: "", price: "", branchId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateCourseDto) => coursesService.create(dto),
    onSuccess: () => {
      toast.success("Kurs qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
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

  const onSubmit = (values: CourseFormValues) => {
    createMutation.mutate({
      name: values.name,
      category: values.category || undefined,
      price: Number(values.price),
      branchId: values.branchId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kurslar</h1>
          <p className="text-sm text-muted-foreground">
            Jami {coursesQuery.data?.meta.total ?? 0} ta kurs
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Kurs qo&apos;shish</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi kurs</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kurs nomi</Label>
                <Input id="name" placeholder="IELTS" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategoriya</Label>
                <Input id="category" placeholder="Til kurslari" {...register("category")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Narxi (so&apos;m)</Label>
                <Input id="price" type="number" {...register("price")} />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
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
              <TableHead>Nomi</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Narxi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coursesQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {coursesQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Hozircha kurslar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {coursesQuery.data?.data.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.category ?? "—"}</TableCell>
                <TableCell>{Number(course.price).toLocaleString("uz-UZ")} so&apos;m</TableCell>
                <TableCell>
                  <Badge variant="secondary">{course.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
