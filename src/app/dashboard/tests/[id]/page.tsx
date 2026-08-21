"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { testsService } from "@/services/tests.service";
import type { CreateQuestionDto, Question, QuestionOption } from "@/types/test";

const questionSchema = z.object({
  text: z.string().min(1, "Savol matnini kiriting"),
  optionA: z.string().min(1, "A variantini kiriting"),
  optionB: z.string().min(1, "B variantini kiriting"),
  optionC: z.string().min(1, "C variantini kiriting"),
  optionD: z.string().min(1, "D variantini kiriting"),
  correctOption: z.enum(["A", "B", "C", "D"]),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const OPTION_ITEMS = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

export default function TestDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const testQuery = useQuery({
    queryKey: ["admin-test", params.id],
    queryFn: () => testsService.get(params.id),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
    },
  });

  const openCreateDialog = () => {
    setEditingQuestion(null);
    reset({
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
    });
    setOpen(true);
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    reset({
      text: question.text,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
    });
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (dto: CreateQuestionDto) =>
      editingQuestion
        ? testsService.updateQuestion(params.id, editingQuestion.id, dto)
        : testsService.addQuestion(params.id, dto),
    onSuccess: () => {
      toast.success(editingQuestion ? "Savol yangilandi" : "Savol qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["admin-test", params.id] });
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

  const removeMutation = useMutation({
    mutationFn: (questionId: string) =>
      testsService.removeQuestion(params.id, questionId),
    onSuccess: () => {
      toast.success("Savol o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["admin-test", params.id] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () =>
      testsService.update(params.id, {
        status: testQuery.data?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      }),
    onSuccess: () => {
      toast.success("Status yangilandi");
      queryClient.invalidateQueries({ queryKey: ["admin-test", params.id] });
    },
  });

  const onSubmit = (values: QuestionFormValues) => {
    const questions = testQuery.data?.questions ?? [];
    saveMutation.mutate({
      ...values,
      order: editingQuestion?.order ?? questions.length + 1,
    });
  };

  const test = testQuery.data;

  return (
    <div className="space-y-6">
      <PageHero
        title={test?.title ?? "Test"}
        subtitle={test?.description ?? "Savollarni boshqarish"}
        action={
          test && (
            <div className="flex gap-2">
              <Button
                variant={test.status === "PUBLISHED" ? "outline" : "default"}
                className={
                  test.status === "PUBLISHED"
                    ? "bg-white text-primary hover:bg-white/90"
                    : ""
                }
                onClick={() => toggleStatusMutation.mutate()}
              >
                {test.status === "PUBLISHED" ? "Qoralamaga o'tkazish" : "E'lon qilish"}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button
                      className="bg-white text-primary hover:bg-white/90"
                      onClick={openCreateDialog}
                    >
                      <PlusIcon />
                      Savol qo&apos;shish
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? "Savolni tahrirlash" : "Yangi savol"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text">Savol matni</Label>
                      <Input id="text" {...register("text")} />
                      {errors.text && (
                        <p className="text-sm text-destructive">{errors.text.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="optionA">A varianti</Label>
                        <Input id="optionA" {...register("optionA")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optionB">B varianti</Label>
                        <Input id="optionB" {...register("optionB")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optionC">C varianti</Label>
                        <Input id="optionC" {...register("optionC")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="optionD">D varianti</Label>
                        <Input id="optionD" {...register("optionD")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>To&apos;g&apos;ri javob</Label>
                      <Select
                        value={watch("correctOption")}
                        onValueChange={(value) =>
                          setValue("correctOption", (value ?? "A") as QuestionOption)
                        }
                        items={OPTION_ITEMS}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPTION_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          )
        }
      />

      {testQuery.isLoading && (
        <p className="text-center text-muted-foreground">Yuklanmoqda...</p>
      )}

      {test && test.questions.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={PlusIcon}
              title="Hozircha savollar yo'q"
              subtitle="Birinchi savolni qo'shib boshlang"
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {test?.questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-medium">
                  {index + 1}. {question.text}
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-sm text-muted-foreground sm:grid-cols-4">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <span
                      key={opt}
                      className={
                        question.correctOption === opt
                          ? "font-semibold text-green-600"
                          : ""
                      }
                    >
                      {opt}) {question[`option${opt}` as keyof Question] as string}
                    </span>
                  ))}
                </div>
                <Badge variant="secondary">To&apos;g&apos;ri: {question.correctOption}</Badge>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEditDialog(question)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    if (confirm("Savolni o'chirishni tasdiqlaysizmi?")) {
                      removeMutation.mutate(question.id);
                    }
                  }}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
