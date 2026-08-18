"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusIcon,
  ReceiptText,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { StatCard } from "@/components/shared/stat-card";
import { branchesService } from "@/services/branches.service";
import { expenseService } from "@/services/expense.service";
import { financeService } from "@/services/finance.service";
import { incomeService } from "@/services/income.service";

const entrySchema = z.object({
  title: z.string().min(2, "Nomini kiriting"),
  category: z.string().optional(),
  amount: z.string().min(1, "Summani kiriting"),
  branchId: z.string().min(1, "Filialni tanlang"),
});

type EntryFormValues = z.infer<typeof entrySchema>;

function formatSum(value: number | string) {
  return Number(value).toLocaleString("uz-UZ");
}

function EntryForm({
  onSubmit,
  branchOptions,
  isPending,
}: {
  onSubmit: (values: EntryFormValues) => void;
  branchOptions: { value: string; label: string }[];
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { title: "", category: "", amount: "", branchId: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Nomi</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Kategoriya (ixtiyoriy)</Label>
        <Input id="category" {...register("category")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Summa (so&apos;m)</Label>
        <Input id="amount" type="number" {...register("amount")} />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Filial</Label>
        <Select
          value={watch("branchId")}
          onValueChange={(value) => setValue("branchId", value ?? "")}
          items={branchOptions}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filialni tanlang" />
          </SelectTrigger>
          <SelectContent>
            {branchOptions.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.branchId && <p className="text-sm text-destructive">{errors.branchId.message}</p>}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          Saqlash
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function FinancePage() {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["finance-summary"],
    queryFn: () => financeService.summary(),
  });
  const incomeQuery = useQuery({
    queryKey: ["income"],
    queryFn: () => incomeService.list({ limit: 20 }),
  });
  const expenseQuery = useQuery({
    queryKey: ["expense"],
    queryFn: () => expenseService.list({ limit: 20 }),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
  });

  const branchOptions =
    branchesQuery.data?.map((b) => ({ value: b.id, label: b.name })) ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    queryClient.invalidateQueries({ queryKey: ["income"] });
    queryClient.invalidateQueries({ queryKey: ["expense"] });
  };

  const onError = (error: unknown) => {
    const message =
      error instanceof AxiosError
        ? (error.response?.data as { message?: string })?.message
        : undefined;
    toast.error(message ?? "Xatolik yuz berdi");
  };

  const createIncome = useMutation({
    mutationFn: (values: EntryFormValues) =>
      incomeService.create({
        title: values.title,
        category: values.category || undefined,
        amount: Number(values.amount),
        branchId: values.branchId,
      }),
    onSuccess: () => {
      toast.success("Kirim qo'shildi");
      invalidate();
      setIncomeOpen(false);
    },
    onError,
  });

  const createExpense = useMutation({
    mutationFn: (values: EntryFormValues) =>
      expenseService.create({
        title: values.title,
        category: values.category || undefined,
        amount: Number(values.amount),
        branchId: values.branchId,
      }),
    onSuccess: () => {
      toast.success("Chiqim qo'shildi");
      invalidate();
      setExpenseOpen(false);
    },
    onError,
  });

  return (
    <div className="space-y-6">
      <PageHero title="Moliya" subtitle="Kirim, chiqim va sof foydani kuzating" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ArrowUpCircle} label="Bugungi kirim" value={`${formatSum(summaryQuery.data?.todayIncome ?? 0)} so'm`} color="green" />
        <StatCard icon={ArrowDownCircle} label="Bugungi chiqim" value={`${formatSum(summaryQuery.data?.todayExpense ?? 0)} so'm`} color="orange" />
        <StatCard icon={TrendingUp} label="Oylik sof foyda" value={`${formatSum(summaryQuery.data?.monthNet ?? 0)} so'm`} color="violet" />
        <StatCard icon={Wallet} label="Oylik kirim" value={`${formatSum(summaryQuery.data?.monthIncome ?? 0)} so'm`} color="blue" />
      </div>

      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">Kirim</TabsTrigger>
          <TabsTrigger value="expense">Chiqim</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
              <DialogTrigger render={<Button><PlusIcon />Kirim qo&apos;shish</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi kirim</DialogTitle>
                </DialogHeader>
                <EntryForm
                  onSubmit={(values) => createIncome.mutate(values)}
                  branchOptions={branchOptions}
                  isPending={createIncome.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!incomeQuery.isLoading && incomeQuery.data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState icon={ReceiptText} title="Hozircha kirim yo'q" subtitle="Birinchi kirimni qo'shib boshlang" />
                    </TableCell>
                  </TableRow>
                )}
                {incomeQuery.data?.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.receivedAt).toLocaleDateString("uz-UZ")}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.category ?? "—"}</TableCell>
                    <TableCell>{formatSum(row.amount)} so&apos;m</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
              <DialogTrigger render={<Button><PlusIcon />Chiqim qo&apos;shish</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi chiqim</DialogTitle>
                </DialogHeader>
                <EntryForm
                  onSubmit={(values) => createExpense.mutate(values)}
                  branchOptions={branchOptions}
                  isPending={createExpense.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!expenseQuery.isLoading && expenseQuery.data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState icon={ReceiptText} title="Hozircha chiqim yo'q" subtitle="Birinchi chiqimni qo'shib boshlang" />
                    </TableCell>
                  </TableRow>
                )}
                {expenseQuery.data?.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.spentAt).toLocaleDateString("uz-UZ")}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.category ?? "—"}</TableCell>
                    <TableCell>{formatSum(row.amount)} so&apos;m</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
