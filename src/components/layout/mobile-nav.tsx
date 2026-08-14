"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLinks } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon />
            <span className="sr-only">Menyu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-3/4 max-w-xs p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Ta&apos;lim Markazi</SheetTitle>
        </SheetHeader>
        <NavLinks onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
