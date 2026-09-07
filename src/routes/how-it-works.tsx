import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Layers, Search, ScrollText, ShieldCheck, Workflow } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — TruthGuard AI" },
      {
        name: "description",
        content:
          "Inside the TruthGuard AI pipeline: text classification, image forensics, claim extraction, live evidence retrieval and weighted multimodal fusion.",
      },
      { property: "og:title", content: "How It Works — TruthGuard AI" },
      {
        property: "og:description",
        content: "A stage-by-stage walkthrough of the real-time fake news detection pipeline.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const stages = [
  {
    icon: ScrollText,
    title: "1 · Text understanding",
    body: "The headline and body are encoded and passed through a transformer sequence-classification head fine-tuned for misinformation cues. It emits a credibility score and per-token attribution weights. Poor grammar or awkward phrasing is never treated as evidence of fakery — only manipulation patterns (fabricated quotes, impossible claims, heavy sensationalism) lower the score.",
    outputs: ["Credibility score", "Token attributions", "Suspicious phrases", "Sentiment"],
  },
  {
    icon: Camera,
    title: "2 · Image forensics",
    body: "When an image is supplied, a vision head examines it for synthetic-generation artefacts, splicing and lighting inconsistencies, and checks whether the visual content actually matches the story being told.",
    outputs: ["Manipulation indicators", "Text/image consistency", "Image credibility score"],
  },
  {
    icon: Search,
    title: "3 · Claim extraction & retrieval",
    body: "Atomic, checkable claims are extracted from the article. Each claim becomes a live web query; only sources actually retrieved at request time are used as evidence — nothing is recalled from model memory.",
    outputs: ["Atomic claims", "Retrieved sources", "Support / contradiction status"],
  },
  {
    icon: Layers,
    title: "4 · Multimodal fusion",
    body: "Text, image, evidence and source-credibility scores are combined using published, evidence-led weights — retrieved external reporting carries the largest share. When a signal is unavailable its weight is redistributed rather than guessed, and a FAKE verdict is only possible when retrieved sources actually contradict a claim.",
    outputs: ["Fused verdict", "Confidence", "Risk score 0–100"],
  },
  {
    icon: ShieldCheck,
    title: "5 · Explanation & recommendation",
    body: "The system writes a rationale grounded strictly in the outputs above and maps the risk band to a publication recommendation, so an editor can defend the decision in review.",
    outputs: ["Written rationale", "Risk band", "Publication recommendation"],
  },
];

function HowItWorks() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Methodology"
        title="How TruthGuard AI works"
        description="Five deterministic stages turn a raw submission into an auditable, evidence-backed credibility decision."
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <ol className="space-y-6">
          {stages.map((s) => (
            <li key={s.title} className="surface-panel p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="rounded-xl bg-primary/12 p-3 text-primary">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.outputs.map((o) => (
                      <span
                        key={o}
                        className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="surface-panel mt-8 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-accent/15 p-3 text-accent">
              <Workflow className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Lightweight Model Mode</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If the AI service is unreachable or rate-limited, the pipeline degrades to a
                deterministic linguistic scorer — sensationalism density, hedging language, caps
                ratio, attribution and numeric-claim counts. Results are clearly labelled as
                Lightweight Model Mode so a weaker signal is never mistaken for a full analysis.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-panel mt-6 p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">What the system will not do</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• It never invents a source, citation, date or author.</li>
            <li>• It never claims certainty; every output is a likelihood with evidence.</li>
            <li>• It never replaces editorial judgement or legal review.</li>
          </ul>
        </section>

        <div className="mt-10 text-center">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Try the pipeline <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
