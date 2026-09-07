import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Target } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — TruthGuard AI" },
      {
        name: "description",
        content:
          "TruthGuard AI is a real-time fake news detection platform using multimodal, explainable AI.",
      },
      { property: "og:title", content: "About — TruthGuard AI" },
      {
        property: "og:description",
        content: "Objectives, scope and ethics of the TruthGuard AI platform.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About the platform"
        title="About TruthGuard AI"
        description="Real-time fake news detection and verification."
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6">
        <section className="surface-panel p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-primary/12 p-3 text-primary">
              <Target className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">The problem</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Most misinformation tooling is reactive: a story spreads, then fact-checkers
                respond days later, long after the damage to public understanding is done.
                TruthGuard AI moves the check upstream — to the moment before an editor, creator
                or citizen hits publish, when a correction still costs nothing.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-panel p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-accent/15 p-3 text-accent">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Objectives</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Detect likely misinformation in real time, before publication.</li>
                <li>• Combine language, vision and live evidence into one fused verdict.</li>
                <li>• Make every decision explainable at token, claim and source level.</li>
                <li>• Persist an auditable trail of analyses for review and reporting.</li>
                <li>• Degrade gracefully instead of failing silently when a signal is missing.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="surface-panel p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-primary/12 p-3 text-primary">
              <BookOpen className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Scope &amp; ethics</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                TruthGuard AI is a decision-support system, not an arbiter of truth. It reports a
                likelihood together with the evidence behind it, and it is explicit whenever a
                signal is unavailable rather than filling the gap with a guess. Verdicts must be
                read alongside human editorial judgement, and the system should never be used to
                suppress lawful speech.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Deliverables</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["Analysis engine", "Multimodal pipeline with explainable outputs"],
              ["REST API", "Analyze, fact-check, history, stats and health endpoints"],
              ["Web application", "Submission, report, history and analytics interfaces"],
              ["Persistence layer", "Postgres records with private image storage"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-display font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/analyze"
            className="inline-flex rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Run an analysis
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
