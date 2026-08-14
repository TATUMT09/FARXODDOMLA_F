"use client";

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
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <MobileNav />
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="text-left text-sm">
                  <div className="font-medium leading-none">{user.fullName}</div>
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                </div>
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
    </header>
  );
}
