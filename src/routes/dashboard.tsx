import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Detection Dashboard — TruthGuard AI" },
      {
        name: "description",
        content:
          "Aggregate statistics across all analyses: verdict distribution, average confidence, risk trends and 14-day activity.",
      },
      { property: "og:title", content: "Detection Dashboard — TruthGuard AI" },
      {
        property: "og:description",
        content: "Verdict distribution, confidence and activity trends across all analyses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const chartColors = {
  REAL: "var(--verdict-real)",
  FAKE: "var(--verdict-fake)",
  UNCERTAIN: "var(--verdict-uncertain)",
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="surface-panel p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function DashboardPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["stats"],
    queryFn: api.stats,
  });

  const pieData = data
    ? [
        { name: "REAL", value: data.real },
        { name: "FAKE", value: data.fake },
        { name: "UNCERTAIN", value: data.uncertain },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Analytics"
        title="Detection dashboard"
        description="Aggregate signal quality across every analysis this deployment has performed."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {isPending && (
          <div className="surface-panel flex items-center justify-center gap-3 p-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Loading statistics…
          </div>
        )}

        {isError && (
          <div className="surface-panel border-destructive/40 p-8 text-sm text-destructive">
            {(error as Error).message}
          </div>
        )}

        {data && data.total === 0 && (
          <div className="surface-panel p-16 text-center">
            <p className="font-display text-lg font-semibold">No data yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Statistics appear once you have run at least one analysis.
            </p>
            <Link
              to="/analyze"
              className="mt-6 inline-flex rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Analyze content
            </Link>
          </div>
        )}

        {data && data.total > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Total analyses" value={String(data.total)} sub="All stored runs" />
              <Metric
                label="Flagged as fake"
                value={String(data.fake)}
                sub={`${Math.round((data.fake / data.total) * 100)}% of all runs`}
              />
              <Metric
                label="Avg. confidence"
                value={`${data.avgConfidence}%`}
                sub="Mean model confidence"
              />
              <Metric label="Avg. risk score" value={`${data.avgRisk}/100`} sub="Mean fused risk" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              <section className="surface-panel p-6">
                <h2 className="font-display text-lg font-semibold">Verdict distribution</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={100}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={chartColors[entry.name as keyof typeof chartColors]}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="surface-panel p-6">
                <h2 className="font-display text-lg font-semibold">Activity — last 14 days</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.activity}>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="REAL" stackId="a" fill={chartColors.REAL} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="UNCERTAIN" stackId="a" fill={chartColors.UNCERTAIN} />
                      <Bar dataKey="FAKE" stackId="a" fill={chartColors.FAKE} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              {data.lightweightRuns} of {data.total} analyses ran in Lightweight Model Mode (the
              deterministic linguistic fallback used when the AI service is unavailable).
            </p>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
