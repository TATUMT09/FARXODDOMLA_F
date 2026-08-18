"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  AlertCircle,
  BanknoteIcon,
  CalendarDays,
  PlusIcon,
  UsersIcon,
  Wallet,
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
import { StudentPicker } from "@/components/shared/student-picker";
import { useAuth } from "@/providers/auth-provider";
import { paymentsService } from "@/services/payments.service";
import type { PaymentMethod } from "@/types/payment";
import type { Student } from "@/types/student";

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Naqd" },
  { value: "CARD", label: "Karta" },
  { value: "TRANSFER", label: "Pul o'tkazmasi" },
  { value: "ONLINE", label: "Onlayn" },
];

const paymentSchema = z.object({
  amount: z.string().min(1, "Summani kiriting"),
  method: z.string().min(1, "To'lov usulini tanlang"),
  note: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function formatSum(value: number | string) {
  return Number(value).toLocaleString("uz-UZ");
}

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [student, setStudent] = useState<Student | null>(null);
  const { user } = useAuth();
  const canRefund = user?.permissions?.includes("payment.refund");
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ["payments", page],
    queryFn: () => paymentsService.list({ page, limit: 10 }),
  });

  const statsQuery = useQuery({
    queryKey: ["payments-stats"],
    queryFn: () => paymentsService.stats(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: "", method: "", note: "" },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["payments-stats"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      paymentsService.create({
        studentId: student!.id,
        amount: Number(watch("amount")),
        method: watch("method") as PaymentMethod,
        note: watch("note") || undefined,
      }),
    onSuccess: () => {
      toast.success("To'lov qabul qilindi");
      invalidateAll();
      reset();
      setStudent(null);
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

  const refundMutation = useMutation({
    mutationFn: (id: string) => paymentsService.refund(id),
    onSuccess: () => {
      toast.success("To'lov qaytarildi");
      invalidateAll();
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : undefined;
      toast.error(message ?? "Xatolik yuz berdi");
    },
  });

  const onSubmit = () => {
    if (!student) {
      toast.error("O'quvchini tanlang");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="To'lovlar"
        subtitle="O'quvchilar to'lovlarini qabul qiling va tarixni kuzating"
        action={
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) {
                reset();
                setStudent(null);
              }
            }}
          >
            <DialogTrigger
              render={
                <Button className="bg-white text-primary hover:bg-white/90">
                  <PlusIcon />
                  To&apos;lov qabul qilish
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi to&apos;lov</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>O&apos;quvchi</Label>
                  <StudentPicker value={student} onChange={setStudent} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Summa (so&apos;m)</Label>
                  <Input id="amount" type="number" {...register("amount")} />
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>To&apos;lov usuli</Label>
                  <Select
                    value={watch("method")}
                    onValueChange={(value) => setValue("method", value ?? "")}
                    items={METHOD_OPTIONS}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Usulni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {METHOD_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.method && (
                    <p className="text-sm text-destructive">{errors.method.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Izoh (ixtiyoriy)</Label>
                  <Input id="note" {...register("note")} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                    Saqlash
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Bugungi tushum"
          value={`${formatSum(statsQuery.data?.todayIncome ?? 0)} so'm`}
          color="green"
        />
        <StatCard
          icon={Wallet}
          label="Oylik tushum"
          value={`${formatSum(statsQuery.data?.monthIncome ?? 0)} so'm`}
          color="violet"
        />
        <StatCard
          icon={UsersIcon}
          label="Qarzdorlar soni"
          value={statsQuery.data?.debtorsCount ?? 0}
          color="orange"
        />
        <StatCard
          icon={AlertCircle}
          label="Jami qarz"
          value={`${formatSum(statsQuery.data?.totalDebt ?? 0)} so'm`}
          color="blue"
        />
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sana</TableHead>
              <TableHead>O&apos;quvchi</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Usul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {!paymentsQuery.isLoading && paymentsQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={BanknoteIcon}
                    title="Hozircha to'lovlar yo'q"
                    subtitle="Birinchi to'lovni qabul qilib boshlang"
                  />
                </TableCell>
              </TableRow>
            )}
            {paymentsQuery.data?.data.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.paidAt).toLocaleDateString("uz-UZ")}</TableCell>
                <TableCell>{payment.student?.fullName ?? "—"}</TableCell>
                <TableCell>{formatSum(payment.amount)} so&apos;m</TableCell>
                <TableCell>
                  {METHOD_OPTIONS.find((m) => m.value === payment.method)?.label}
                </TableCell>
                <TableCell>
                  <Badge variant={payment.status === "REFUNDED" ? "destructive" : "secondary"}>
                    {payment.status === "REFUNDED" ? "Qaytarilgan" : "Bajarilgan"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {canRefund && payment.status === "COMPLETED" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={refundMutation.isPending}
                      onClick={() => refundMutation.mutate(payment.id)}
                    >
                      Qaytarish
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {paymentsQuery.data && paymentsQuery.data.meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={paymentsQuery.data.meta.totalPages}
            total={paymentsQuery.data.meta.total}
            itemLabel="to'lov"
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
