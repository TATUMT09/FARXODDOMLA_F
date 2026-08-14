"use client";

import { BellIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { MobileNav } from "./mobile-nav";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar() {
  const { user, logout } = useAuth();

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
              <DropdownMenuLabel>{user.phone}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
