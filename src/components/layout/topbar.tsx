"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, ChevronDownIcon, HistoryIcon, SearchIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth.service";
import { branchesService } from "@/services/branches.service";
import { MobileNav } from "./mobile-nav";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesService.list(),
    enabled: open,
  });
  const branchName = branchesQuery.data?.find((b) => b.id === user?.branchId)?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mening profilim</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="divide-y">
            <InfoRow label="F.I.Sh" value={user.fullName} />
            <InfoRow label="Telefon" value={user.phone} />
            <InfoRow label="Login" value={user.login ?? "—"} />
            <InfoRow label="Rol" value={user.role} />
            <InfoRow label="Filial" value={branchName ?? "—"} />
            <InfoRow label="Status" value={user.status === "ACTIVE" ? "Faol" : "Nofaol"} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SessionsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const sessionsQuery = useQuery({
    queryKey: ["auth-sessions"],
    queryFn: () => authService.sessions(),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kirish tarixi</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {sessionsQuery.isLoading && (
            <p className="py-4 text-center text-sm text-muted-foreground">Yuklanmoqda...</p>
          )}
          {sessionsQuery.data?.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Kirish tarixi topilmadi
            </p>
          )}
          {sessionsQuery.data?.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span>
                {new Date(session.createdAt).toLocaleString("uz-UZ")}
              </span>
              <Badge variant={session.revokedAt ? "secondary" : "secondary"}>
                {session.revokedAt ? "Yakunlangan" : "Faol"}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Topbar() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav />
        {user && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              Xush kelibsiz, {user.fullName}!
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Siz tizimda{" "}
              <span className="font-medium text-primary">
                {user.role.toLowerCase()}
              </span>{" "}
              sifatida ishlayapsiz
            </p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <SearchIcon />
          <span className="sr-only">Qidirish</span>
        </Button>
        <Button variant="ghost" size="icon">
          <BellIcon />
          <span className="sr-only">Bildirishnomalar</span>
        </Button>

        {user && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="flex items-center gap-2 pr-1.5 pl-2">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left text-sm md:block">
                      <div className="font-medium leading-none">{user.fullName}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </div>
                    <ChevronDownIcon className="size-4 text-muted-foreground" />
                  </Button>
                }
              />

              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user.phone}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                    <UserIcon />
                    Mening profilim
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSessionsOpen(true)}>
                    <HistoryIcon />
                    Kirish tarixi
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                    Chiqish
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
            <SessionsDialog open={sessionsOpen} onOpenChange={setSessionsOpen} />
          </>
        )}
      </div>
    </header>
  );
}
