import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ResultDashboard } from "@/components/analysis/ResultDashboard";
import { api } from "@/lib/api";

export const Route = createFileRoute("/result/$id")({
  head: () => ({
    meta: [
      { title: "Analysis Report — TruthGuard AI" },
      {
        name: "description",
        content:
          "Detailed credibility report: verdict, risk score, token attributions, image forensics and retrieved evidence.",
      },
      { property: "og:title", content: "Analysis Report — TruthGuard AI" },
      {
        property: "og:description",
        content: "Explainable multimodal misinformation analysis report.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => api.analysis(id),
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/history"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to history
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
          >
            <Printer className="size-4" /> Print / save report
          </button>
        </div>

        {isPending && (
          <div className="surface-panel flex items-center justify-center gap-3 p-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Loading report…
          </div>
        )}

        {isError && (
          <div className="surface-panel border-destructive/40 p-10 text-center">
            <p className="font-display text-lg font-semibold">Report unavailable</p>
            <p className="mt-2 text-sm text-muted-foreground">{(error as Error).message}</p>
            <Link
              to="/analyze"
              className="mt-6 inline-flex rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Run a new analysis
            </Link>
          </div>
        )}

        {data && <ResultDashboard result={data} />}
      </div>
    </SiteLayout>
  );
}
