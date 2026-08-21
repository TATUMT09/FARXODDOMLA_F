"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  HelpCircleIcon,
  PlusIcon,
  SearchIcon,
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
import { testsService } from "@/services/tests.service";
import type { CreateTestDto } from "@/types/test";

const testSchema = z.object({
  title: z.string().min(2, "Test nomini kiriting"),
  description: z.string().optional().or(z.literal("")),
  durationMinutes: z.string().min(1, "Davomiylikni kiriting"),
});

type TestFormValues = z.infer<typeof testSchema>;

export default function TestsAdminPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const testsQuery = useQuery({
    queryKey: ["admin-tests", page, search],
    queryFn: () => testsService.list({ page, limit: 10, search: search || undefined }),
  });

  const stats = useMemo(() => {
    const data = testsQuery.data?.data ?? [];
    const published = data.filter((t) => t.status === "PUBLISHED").length;
    const totalQuestions = data.reduce(
      (sum, t) => sum + (t._count?.questions ?? 0),
      0,
    );
    return { published, totalQuestions };
  }, [testsQuery.data]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: { title: "", description: "", durationMinutes: "" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTestDto) => testsService.create(dto),
    onSuccess: () => {
      toast.success("Test qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["admin-tests"] });
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

  const onSubmit = (values: TestFormValues) => {
    createMutation.mutate({
      title: values.title,
      description: values.description || undefined,
      durationMinutes: Number(values.durationMinutes),
    });
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Testlar"
        subtitle={`Jami ${testsQuery.data?.meta.total ?? 0} ta test`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="bg-white text-primary hover:bg-white/90">
                  <PlusIcon />
                  Test qo&apos;shish
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi test</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test nomi</Label>
                  <Input id="title" placeholder="Algebra — 1-bosqich" {...register("title")} />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
                  <Input id="description" {...register("description")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Davomiyligi (daqiqa)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    placeholder="30"
                    {...register("durationMinutes")}
                  />
                  {errors.durationMinutes && (
                    <p className="text-sm text-destructive">
                      {errors.durationMinutes.message}
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
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardListIcon} label="Jami testlar" value={testsQuery.data?.meta.total ?? 0} color="violet" />
        <StatCard icon={CheckCircle2Icon} label="E'lon qilingan" value={stats.published} color="green" />
        <StatCard icon={HelpCircleIcon} label="Jami savollar" value={stats.totalQuestions} color="blue" />
      </div>

      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead>Davomiyligi</TableHead>
              <TableHead>Savollar</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {!testsQuery.isLoading && (testsQuery.data?.data.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    icon={ClipboardListIcon}
                    title="Hozircha testlar yo'q"
                    subtitle="Birinchi testni qo'shib boshlang"
                  />
                </TableCell>
              </TableRow>
            )}
            {testsQuery.data?.data.map((test) => (
              <TableRow key={test.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/tests/${test.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {test.title}
                  </Link>
                </TableCell>
                <TableCell>{test.durationMinutes} daqiqa</TableCell>
                <TableCell>{test._count?.questions ?? 0}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{test.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {testsQuery.data && testsQuery.data.meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={testsQuery.data.meta.totalPages}
            total={testsQuery.data.meta.total}
            itemLabel="test"
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
