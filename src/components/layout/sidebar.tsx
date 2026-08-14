import { GraduationCap } from "lucide-react";
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold leading-tight text-primary">
            IML
          </div>
          <div className="truncate text-xs font-semibold uppercase tracking-wide text-primary/80">
            O&apos;quv markazi
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Ta&apos;lim Markazi ERP
          </div>
        </div>
      </div>

      <NavLinks />

      <div className="p-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-fuchsia-600 p-4 text-primary-foreground">
          <GraduationCap className="absolute -right-2 -top-2 size-16 opacity-20" />
          <p className="text-sm font-semibold leading-snug">
            IML — Bilim bilan kelajak sari!
          </p>
          <p className="mt-1 text-xs text-primary-foreground/80">
            Samarali boshqaruv, sifatli ta&apos;lim.
          </p>
        </div>
      </div>
    </aside>
  );
}
