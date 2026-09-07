import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/truthguard-logo.png";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/history", label: "History" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/model", label: "Model" },
  { to: "/about", label: "About" },
] as const;

function StatusPill() {
  const { data, isError } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 60_000,
  });
  const online = !isError && data?.status === "online";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        online
          ? "border-verdict-real/40 bg-verdict-real/10 text-verdict-real"
          : "border-verdict-uncertain/40 bg-verdict-uncertain/10 text-verdict-uncertain",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full animate-pulse-dot",
          online ? "bg-verdict-real" : "bg-verdict-uncertain",
        )}
      />
      {online ? "System Online" : data ? "Degraded" : "Checking…"}
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src={logo} alt="TruthGuard AI logo" width={32} height={32} className="size-8" />
          <span className="font-display text-lg font-semibold tracking-tight">
            TruthGuard <span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <StatusPill />
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-card/95 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 sm:hidden">
              <StatusPill />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
