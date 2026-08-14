import type { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function PageHero({ title, subtitle, action }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-fuchsia-600 px-6 py-8 text-primary-foreground shadow-sm sm:px-8">
      <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 right-24 size-48 rounded-full bg-white/10" />
      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-primary-foreground/80">{subtitle}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
