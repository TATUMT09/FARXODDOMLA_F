"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTestTakerAuth } from "@/providers/test-taker-auth-provider";

export function TestsNav() {
  const { testTaker, status, logout } = useTestTakerAuth();

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
      <Link href="/tests" className="flex items-center gap-2 font-bold text-primary">
        <GraduationCap className="size-6" />
        IML Testlar
      </Link>
      <div className="flex items-center gap-2">
        {status === "authenticated" && testTaker ? (
          <>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/tests/profile">Statistikam</Link>}
            />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {testTaker.fullName}
            </span>
            <Button variant="outline" onClick={() => logout()}>
              Chiqish
            </Button>
          </>
        ) : status === "unauthenticated" ? (
          <>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/tests/login">Kirish</Link>}
            />
            <Button
              nativeButton={false}
              render={<Link href="/tests/register">Ro&apos;yxatdan o&apos;tish</Link>}
            />
          </>
        ) : null}
      </div>
    </header>
  );
}
