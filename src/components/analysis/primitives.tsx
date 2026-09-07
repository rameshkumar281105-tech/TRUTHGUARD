import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { RiskLevel, Verdict } from "@/lib/analysis-types";

export function Panel({
  title,
  icon,
  description,
  children,
  className,
}: {
  title?: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-panel p-5 sm:p-6", className)}>
      {title && (
        <header className="mb-4 flex items-start gap-3">
          {icon && (
            <span className="mt-0.5 rounded-lg bg-primary/12 p-2 text-primary">{icon}</span>
          )}
          <div>
            <h3 className="font-display text-base font-semibold sm:text-lg">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

export const verdictStyles: Record<Verdict, string> = {
  REAL: "border-verdict-real/40 bg-verdict-real/12 text-verdict-real",
  FAKE: "border-verdict-fake/40 bg-verdict-fake/12 text-verdict-fake",
  UNCERTAIN: "border-verdict-uncertain/40 bg-verdict-uncertain/12 text-verdict-uncertain",
};

export function VerdictBadge({
  verdict,
  size = "md",
}: {
  verdict: Verdict;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold tracking-wide",
        verdictStyles[verdict],
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3.5 py-1.5 text-sm",
        size === "lg" && "px-5 py-2 font-display text-xl sm:text-2xl",
      )}
    >
      <span className="size-2 rounded-full bg-current" />
      {verdict}
    </span>
  );
}

const riskColors: Record<RiskLevel, string> = {
  Low: "text-risk-low",
  Moderate: "text-risk-moderate",
  High: "text-risk-high",
  Critical: "text-risk-critical",
};

export function RiskMeter({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Overall risk score</span>
        <span className={cn("font-display text-2xl font-semibold", riskColors[level])}>
          {Math.round(score)}
          <span className="text-sm text-muted-foreground">/100</span>
        </span>
      </div>
      <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient transition-[width] duration-700"
          style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>0–30 Low</span>
        <span>31–60 Moderate</span>
        <span>61–80 High</span>
        <span>81–100 Critical</span>
      </div>
      <p className={cn("mt-2 text-sm font-medium", riskColors[level])}>{level} risk</p>
    </div>
  );
}

export function ScoreCard({
  label,
  score,
  hint,
}: {
  label: string;
  score: number | null;
  hint?: string;
}) {
  const available = score !== null && score !== undefined;
  return (
    <div className="surface-panel p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">
        {available ? Math.round(score) : "—"}
        {available && <span className="text-base text-muted-foreground">/100</span>}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-brand-gradient transition-[width] duration-700"
          style={{ width: available ? `${score}%` : "0%" }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {available ? hint : "Not Available"}
      </p>
    </div>
  );
}

export function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium break-all">
        {value ? value : <span className="text-muted-foreground">Not Provided</span>}
      </span>
    </div>
  );
}
