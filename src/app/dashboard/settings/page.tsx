"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/shared/page-hero";
import { settingsService } from "@/services/settings.service";

const settingsSchema = z.object({
  centerName: z.string().min(2, "Markaz nomini kiriting"),
  address: z.string().optional(),
  phone: z.string().optional(),
  workingHours: z.string().optional(),
  currency: z.string().min(1, "Valyutani kiriting"),
  timezone: z.string().min(1, "Vaqt zonasini kiriting"),
  lateThresholdMinutes: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.get(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<SettingsFormValues>({
      resolver: zodResolver(settingsSchema),
      defaultValues: {
        centerName: "",
        address: "",
        phone: "",
        workingHours: "",
        currency: "UZS",
        timezone: "Asia/Tashkent",
        lateThresholdMinutes: "15",
      },
    });

  useEffect(() => {
    if (!settingsQuery.data) return;
    reset({
      centerName: settingsQuery.data.centerName,
      address: settingsQuery.data.address ?? "",
      phone: settingsQuery.data.phone ?? "",
      workingHours: settingsQuery.data.workingHours ?? "",
      currency: settingsQuery.data.currency,
      timezone: settingsQuery.data.timezone,
      lateThresholdMinutes: String(settingsQuery.data.lateThresholdMinutes),
    });
  }, [settingsQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: SettingsFormValues) =>
      settingsService.update({
        centerName: values.centerName,
        address: values.address || undefined,
        phone: values.phone || undefined,
        workingHours: values.workingHours || undefined,
        currency: values.currency,
        timezone: values.timezone,
        lateThresholdMinutes: Number(values.lateThresholdMinutes),
      }),
    onSuccess: () => {
      toast.success("Sozlamalar saqlandi");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : undefined;
      toast.error(message ?? "Xatolik yuz berdi");
    },
  });

  return (
    <div className="space-y-6">
      <PageHero title="Sozlamalar" subtitle="Markazning umumiy ma'lumotlarini boshqaring" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Markaz ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="centerName">Markaz nomi</Label>
              <Input id="centerName" {...register("centerName")} />
              {errors.centerName && (
                <p className="text-sm text-destructive">{errors.centerName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Manzil</Label>
              <Input id="address" {...register("address")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" placeholder="+998901234567" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours">Ish vaqti</Label>
              <Input id="workingHours" placeholder="09:00 - 18:00" {...register("workingHours")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Valyuta</Label>
                <Input id="currency" {...register("currency")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Vaqt zonasi</Label>
                <Input id="timezone" {...register("timezone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateThresholdMinutes">Kechikish chegarasi (daqiqa)</Label>
              <Input
                id="lateThresholdMinutes"
                type="number"
                {...register("lateThresholdMinutes")}
              />
            </div>
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              Saqlash
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
