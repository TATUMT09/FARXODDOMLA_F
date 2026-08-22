"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicAuthService } from "@/services/public-auth.service";

const registerSchema = z.object({
  fullName: z.string().min(2, "F.I.Sh kiriting"),
  phone: z.string().min(5, "Telefon kiriting"),
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function TestsRegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await publicAuthService.register(values);
      router.push(`/tests/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : undefined;
      setServerError(message ?? "Xatolik yuz berdi");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[url('/kirishfon.webp')] bg-cover bg-center px-4">
      <div className="absolute inset-0 bg-black/10" />
      <Card className="relative w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CardTitle>Testlarga ro&apos;yxatdan o&apos;tish</CardTitle>
          <CardDescription>
            Ma&apos;lumotlaringizni kiriting, emailingizga tasdiqlash kodi yuboriladi
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            <Button
              type="submit"
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Hisobingiz bormi?{" "}
              <Link href="/tests/login" className="text-orange-600 hover:underline">
                Kirish
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
