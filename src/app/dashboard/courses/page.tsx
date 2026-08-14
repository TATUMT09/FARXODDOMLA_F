"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  BookOpen,
  LayersIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  WalletIcon,
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
import { coursesService } from "@/services/courses.service";
import type { CreateCourseDto } from "@/types/course";

const courseSchema = z.object({
  name: z.string().min(2, "Kurs nomini kiriting"),
  category: z.string().optional().or(z.literal("")),
  price: z.string().min(1, "Narxni kiriting"),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const STATUS_FILTERS = [
  { value: "ALL", label: "Barcha statuslar" },
  { value: "ACTIVE", label: "Faol" },
  { value: "INACTIVE", label: "Nofaol" },
];

export default function CoursesPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ["courses", page, search],
    queryFn: () => coursesService.list({ page, limit: 10, search: search || undefined }),
  });

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

  const rows = useMemo(() => {
    const data = coursesQuery.data?.data ?? [];
    return statusFilter === "ALL"
      ? data
      : data.filter((c) => c.status === statusFilter);
  }, [coursesQuery.data, statusFilter]);

  const stats = useMemo(() => {
    const data = coursesQuery.data?.data ?? [];
    const active = data.filter((c) => c.status === "ACTIVE").length;
    const categories = new Set(data.map((c) => c.category).filter(Boolean)).size;
    const avgPrice = data.length
      ? Math.round(data.reduce((sum, c) => sum + Number(c.price), 0) / data.length)
      : 0;
    return { active, categories, avgPrice };
  }, [coursesQuery.data]);

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
      <PageHero
        title="Kurslar"
        subtitle={`Jami ${coursesQuery.data?.meta.total ?? 0} ta kurs`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="bg-white text-primary hover:bg-white/90">
                  <PlusIcon />
                  Kurs qo&apos;shish
                </Button>
              }
            />
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
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Jami kurslar" value={coursesQuery.data?.meta.total ?? 0} color="violet" />
        <StatCard icon={UserCheckIcon} label="Faol kurslar" value={stats.active} color="green" />
        <StatCard icon={LayersIcon} label="Kategoriyalar" value={stats.categories} color="orange" />
        <StatCard icon={WalletIcon} label="O'rtacha narx" value={stats.avgPrice.toLocaleString("uz-UZ")} color="blue" />
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
            {!coursesQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    icon={BookOpen}
                    title="Hozircha kurslar yo'q"
                    subtitle="Birinchi kursni qo'shib boshlang"
                  />
                </TableCell>
              </TableRow>
            )}
            {rows.map((course) => (
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
        {coursesQuery.data && coursesQuery.data.meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={coursesQuery.data.meta.totalPages}
            total={coursesQuery.data.meta.total}
            itemLabel="kurs"
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
