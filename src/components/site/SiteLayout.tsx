import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="hero-glow border-b border-border/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
      </div>
    </header>
  );
}
