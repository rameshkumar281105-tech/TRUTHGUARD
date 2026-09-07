import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2 } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { VerdictBadge } from "@/components/analysis/primitives";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Analysis History — TruthGuard AI" },
      {
        name: "description",
        content:
          "Browse, search and filter every stored pre-publication credibility analysis with its verdict and risk score.",
      },
      { property: "og:title", content: "Analysis History — TruthGuard AI" },
      {
        property: "og:description",
        content: "A searchable audit trail of past misinformation analyses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

const filters = ["ALL", "REAL", "FAKE", "UNCERTAIN"] as const;

function HistoryPage() {
  const qc = useQueryClient();
  const [verdict, setVerdict] = useState<(typeof filters)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["history", verdict, query, page],
    queryFn: () =>
      api.history({
        verdict,
        search: query,
        page: String(page),
        perPage: "10",
      }),
  });

  const del = useMutation({
    mutationFn: api.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Audit trail"
        title="Analysis history"
        description="Every analysis is persisted with its full evidence bundle so decisions stay reviewable."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="surface-panel flex flex-wrap items-center gap-4 p-4">
          <form
            className="relative flex-1 min-w-[240px]"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQuery(search.trim());
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search headlines…"
              aria-label="Search headlines"
              className="w-full rounded-xl border border-input bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setVerdict(f);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors",
                  verdict === f
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {isPending && (
            <div className="surface-panel flex items-center justify-center gap-3 p-14 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Loading history…
            </div>
          )}

          {isError && (
            <div className="surface-panel border-destructive/40 p-8 text-sm text-destructive">
              {(error as Error).message}
            </div>
          )}

          {data && data.items.length === 0 && (
            <div className="surface-panel p-14 text-center">
              <p className="font-display text-lg font-semibold">No analyses yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Run your first pre-publication check to populate this audit trail.
              </p>
              <Link
                to="/analyze"
                className="mt-6 inline-flex rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Analyze content
              </Link>
            </div>
          )}

          {data?.items.map((item) => (
            <article
              key={item.id}
              className="surface-panel flex flex-wrap items-center gap-4 p-5 transition-colors hover:border-ring/50"
            >
              <div className="min-w-[220px] flex-1">
                <Link
                  to="/result/$id"
                  params={{ id: item.id }}
                  className="font-medium hover:text-primary"
                >
                  {item.headline}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                  {item.source_name ? ` · ${item.source_name}` : ""}
                </p>
              </div>
              <VerdictBadge verdict={item.prediction} size="sm" />
              <div className="text-right text-xs text-muted-foreground">
                <p>Confidence {item.confidence}%</p>
                <p>Risk {Math.round(item.risk_score)}/100</p>
              </div>
              <button
                type="button"
                aria-label={`Delete analysis: ${item.headline}`}
                onClick={() => del.mutate(item.id)}
                disabled={del.isPending}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </article>
          ))}
        </div>

        {data && data.total > data.perPage && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
