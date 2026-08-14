"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="relative flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          <Image
            src="/logo.png"
            alt=""
            aria-hidden
            fill
            className="pointer-events-none absolute inset-0 object-contain opacity-[0.04] select-none"
          />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
