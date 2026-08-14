import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-semibold">Ta&apos;lim Markazi</span>
      </div>
      <NavLinks />
    </aside>
  );
}
