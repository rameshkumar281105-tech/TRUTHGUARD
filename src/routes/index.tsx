import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Camera,
  Database,
  Gauge,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import heroImage from "@/assets/hero-console.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TruthGuard AI — Real-Time Fake News Detection" },
      {
        name: "description",
        content:
          "Pre-publication misinformation analysis: transformer text classification, image forensics, live evidence retrieval and explainable multimodal scoring.",
      },
      { property: "og:title", content: "TruthGuard AI — Real-Time Fake News Detection" },
      {
        property: "og:description",
        content:
          "Analyse a headline, body and image before you publish. Explainable verdicts backed by live retrieved evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: BrainCircuit,
    title: "Transformer Text Analysis",
    body: "A BERT-style sequence classifier scores the headline and body, returning per-token attributions instead of an opaque number.",
  },
  {
    icon: Camera,
    title: "Image Forensics",
    body: "A vision head inspects uploaded imagery for synthetic-generation artefacts, edit traces and headline/image mismatch.",
  },
  {
    icon: Search,
    title: "Live Evidence Retrieval",
    body: "Atomic claims are extracted and checked against sources fetched from the open web at request time — never fabricated.",
  },
  {
    icon: Layers,
    title: "Multimodal Fusion",
    body: "Text, image, evidence and source credibility are fused with transparent weights that re-normalise when a signal is missing.",
  },
  {
    icon: Sparkles,
    title: "Explainable AI",
    body: "Every verdict ships with token heat, matched evidence, source notes and a written rationale you can defend in review.",
  },
  {
    icon: Database,
    title: "Persistent Audit Trail",
    body: "Each run is stored with its full evidence bundle so the analysis can be reopened, filtered and cited later.",
  },
];

const steps = [
  { n: "01", t: "Submit", d: "Paste the headline and body, add source metadata and optionally an image." },
  { n: "02", t: "Analyse", d: "Text, vision and retrieval heads execute in parallel on the server." },
  { n: "03", t: "Verify", d: "Extracted claims are matched against live retrieved sources." },
  { n: "04", t: "Decide", d: "A fused verdict, risk score and rationale guide the publication call." },
];

function Home() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" />
              AI-Powered Fake News Detection
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Verify before you <span className="text-gradient">amplify</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              TruthGuard AI analyses a news item <em>before</em> it goes live — combining
              transformer language modelling, image forensics and live evidence retrieval into a
              single explainable credibility verdict.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
              >
                Analyze content
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                How it works
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { k: "4", v: "Analysis heads" },
                { k: "Live", v: "Web evidence" },
                { k: "100%", v: "Explainable output" },
              ].map((s) => (
                <div key={s.v} className="surface-panel p-4">
                  <dt className="font-display text-2xl font-semibold text-gradient">{s.k}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-rise">
            <div className="surface-panel relative overflow-hidden p-2">
              <img
                src={heroImage}
                alt="TruthGuard AI verification console visualising credibility signals"
                className="w-full rounded-xl object-cover"
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-brand-gradient opacity-15 blur-2xl animate-scan"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">A full detection pipeline</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Six coordinated capabilities produce one auditable decision.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="surface-panel p-6 transition-transform hover:-translate-y-1">
              <span className="inline-flex rounded-xl bg-primary/12 p-2.5 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="surface-panel p-8">
          <h2 className="font-display text-2xl font-semibold">From submission to decision</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n}>
                <p className="font-mono text-sm text-primary">{s.n}</p>
                <p className="mt-2 font-display text-lg font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="surface-panel hero-glow flex flex-wrap items-center justify-between gap-6 p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Run your first pre-publication check
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Paste a story, add the source, upload the image — get a verdict with evidence in
              under a minute.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Gauge className="size-4" /> Start analysis
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary"
            >
              <Activity className="size-4" /> View dashboard
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
