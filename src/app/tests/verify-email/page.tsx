"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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
import { useTestTakerAuth } from "@/providers/test-taker-auth-provider";
import { publicAuthService } from "@/services/public-auth.service";

const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
});
type CodeFormValues = z.infer<typeof codeSchema>;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { applyAuthResponse } = useTestTakerAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CodeFormValues>({ resolver: zodResolver(codeSchema) });

  const onSubmit = async (values: CodeFormValues) => {
    setServerError(null);
    try {
      const res = await publicAuthService.verifyEmail(email, values.code);
      applyAuthResponse(res);
      router.push("/tests");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : undefined;
      setServerError(message ?? "Kod noto'g'ri yoki muddati tugagan");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[url('/kirishfon.webp')] bg-cover bg-center px-4">
      <div className="absolute inset-0 bg-black/10" />
      <Card className="relative w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CardTitle>Emailni tasdiqlash</CardTitle>
          <CardDescription>
            {email
              ? `${email} manziliga yuborilgan 6 xonali kodni kiriting`
              : "Emailingizga yuborilgan 6 xonali kodni kiriting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Tasdiqlash kodi</Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                className="text-center text-lg tracking-[0.5em]"
                autoComplete="one-time-code"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
