"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
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
import { authService } from "@/services/auth.service";

type Step = "email" | "code" | "password" | "done";

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string })?.message ?? fallback;
  }
  return fallback;
}

const emailSchema = z.object({
  email: z.string().email("To'g'ri email kiriting"),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
});
type CodeFormValues = z.infer<typeof codeSchema>;

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<CodeFormValues>({ resolver: zodResolver(codeSchema) });
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmitEmail = async (values: EmailFormValues) => {
    setServerError(null);
    try {
      await authService.forgotPassword(values.email);
      setEmail(values.email);
      setStep("code");
    } catch (error) {
      setServerError(errorMessage(error, "Xatolik yuz berdi"));
    }
  };

  const onSubmitCode = async (values: CodeFormValues) => {
    setServerError(null);
    try {
      const { resetToken: token } = await authService.verifyResetCode(email, values.code);
      setResetToken(token);
      setStep("password");
    } catch (error) {
      setServerError(errorMessage(error, "Kod noto'g'ri yoki muddati tugagan"));
    }
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    setServerError(null);
    try {
      await authService.resetPassword(resetToken, values.newPassword);
      setStep("done");
    } catch (error) {
      setServerError(errorMessage(error, "Xatolik yuz berdi"));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[url('/kirishfon.webp')] bg-cover bg-center px-4">
      <div className="absolute inset-0 bg-black/10" />
      <Card className="relative w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CardTitle>Parolni tiklash</CardTitle>
          <CardDescription>
            {step === "email" && "Ro'yxatdan o'tgan emailingizni kiriting"}
            {step === "code" && `${email} manziliga yuborilgan 6 xonali kodni kiriting`}
            {step === "password" && "Yangi parolingizni kiriting"}
            {step === "done" && "Parolingiz muvaffaqiyatli yangilandi"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting ? "Yuborilmoqda..." : "Kod yuborish"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Kirish sahifasiga qaytish
                </Link>
              </p>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Tasdiqlash kodi</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.5em]"
                  autoComplete="one-time-code"
                  {...codeForm.register("code")}
                />
                {codeForm.formState.errors.code && (
                  <p className="text-sm text-destructive">
                    {codeForm.formState.errors.code.message}
                  </p>
                )}
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={codeForm.formState.isSubmitting}>
                {codeForm.formState.isSubmitting ? "Tekshirilmoqda..." : "Tasdiqlash"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setServerError(null);
                  setStep("email");
                }}
              >
                Ortga
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yangi parol</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yangi parolni takrorlang</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? "Saqlanmoqda..." : "Parolni saqlash"}
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Endi yangi parolingiz bilan tizimga kirishingiz mumkin.
              </p>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/login">Kirish</Link>}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
