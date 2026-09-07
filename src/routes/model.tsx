import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/model")({
  head: () => ({
    meta: [
      { title: "Model & Architecture — TruthGuard AI" },
      {
        name: "description",
        content:
          "Architecture of TruthGuard AI: transformer classification head, vision analysis head, retrieval-augmented fact verification and weighted fusion layer.",
      },
      { property: "og:title", content: "Model & Architecture — TruthGuard AI" },
      {
        property: "og:description",
        content: "Fusion weights, scoring bands and the technical stack behind the detector.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModelPage,
});

const weights = [
  { signal: "Evidence support", weight: "45%", note: "Retrieval-grounded claim verification against live external reporting — the dominant signal" },
  { signal: "Text credibility", weight: "20%", note: "Transformer sequence classification of headline + body; grammar or style alone can never convict" },
  { signal: "Source credibility", weight: "20%", note: "Domain, HTTPS, attribution and metadata completeness" },
  { signal: "Image credibility", weight: "15%", note: "Vision forensics; skipped and re-weighted when absent" },
];

const bands = [
  { range: "0 – 30", level: "Low", meaning: "Signals align with authentic reporting." },
  { range: "31 – 60", level: "Moderate", meaning: "Mixed signals; verify weak claims before publishing." },
  { range: "61 – 80", level: "High", meaning: "Several credibility failures; strong verification required." },
  { range: "81 – 100", level: "Critical", meaning: "Contradicted claims or heavy manipulation markers." },
];

function ModelPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Architecture"
        title="Model & architecture"
        description="What runs, in what order, with what weight — and the honest limits of each component."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6">
        <section className="surface-panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Pipeline topology</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface p-5 font-mono text-xs leading-relaxed text-muted-foreground">
{`Submission (headline, body, image?, source metadata?)
        │
        ├── Text head        → credibility, verdict, token attributions
        ├── Vision head      → manipulation indicators, consistency  (skipped if no image)
        ├── Claim extractor  → atomic claims
        │        └── Live web retrieval → grounded claim verification
        └── Source heuristics → domain / HTTPS / attribution score
                    │
             Weighted fusion layer (re-normalised over available signals)
                    │
        Verdict · Confidence · Risk score · Explanation · Recommendation
                    │
             Persisted to Lovable Cloud (Postgres + private image storage)`}
          </pre>
        </section>

        <section className="surface-panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Fusion weights</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3">Signal</th>
                  <th className="pb-3">Weight</th>
                  <th className="pb-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {weights.map((w) => (
                  <tr key={w.signal} className="border-t border-border/70">
                    <td className="py-3 font-medium">{w.signal}</td>
                    <td className="py-3 font-mono text-primary">{w.weight}</td>
                    <td className="py-3 text-muted-foreground">{w.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Weights are re-normalised over the signals actually available for a given submission,
            so a missing image or blocked retrieval never silently biases the verdict. A FAKE verdict
            additionally requires at least one claim contradicted by retrieved external reporting —
            suspicious writing style by itself can at most produce UNCERTAIN.
          </p>
        </section>

        <section className="surface-panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Risk bands</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {bands.map((b) => (
              <div key={b.level} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-mono text-xs text-primary">{b.range}</p>
                <p className="mt-1 font-display text-lg font-semibold">{b.level}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Technology stack</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Frontend</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>React 19 + TypeScript</li>
                <li>Vite build tooling</li>
                <li>Tailwind CSS design system</li>
                <li>Lucide icons · Recharts visualisations</li>
                <li>TanStack Router + Query</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Backend &amp; AI</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>TypeScript server routes (REST API)</li>
                <li>Transformer classification &amp; vision heads</li>
                <li>Live web retrieval for evidence grounding</li>
                <li>Postgres persistence + private object storage</li>
                <li>Deterministic linguistic fallback scorer</li>
              </ul>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            The original proposal specified Python/Flask with PyTorch. The deployment target is a
            serverless edge runtime with no Python process, so the equivalent architecture is
            implemented in TypeScript: the same heads, the same fusion mathematics and the same
            REST contract (<span className="font-mono text-xs">/api/analyze</span>,{" "}
            <span className="font-mono text-xs">/api/fact-check</span>,{" "}
            <span className="font-mono text-xs">/api/history</span>,{" "}
            <span className="font-mono text-xs">/api/stats</span>,{" "}
            <span className="font-mono text-xs">/api/health</span>).
          </p>
        </section>

        <section className="surface-panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Known limitations</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Retrieval quality depends on what the open web indexes at request time.</li>
            <li>• Very recent breaking events may have no corroborating sources yet.</li>
            <li>• Image forensics is indicative; it cannot prove provenance.</li>
            <li>• Satire and opinion can resemble misinformation lexically.</li>
          </ul>
        </section>
      </div>
    </SiteLayout>
  );
}
