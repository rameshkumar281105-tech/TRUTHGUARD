import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ExternalLink,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  ScrollText,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { AnalysisResult, ClaimCheck } from "@/lib/analysis-types";
import { cn } from "@/lib/utils";
import { Field, Panel, RiskMeter, ScoreCard, VerdictBadge } from "./primitives";

const claimIcon = {
  SUPPORTED: <CheckCircle2 className="size-4 text-verdict-real" />,
  CONTRADICTED: <XCircle className="size-4 text-verdict-fake" />,
  UNVERIFIED: <HelpCircle className="size-4 text-verdict-uncertain" />,
};

const claimTone = {
  SUPPORTED: "border-verdict-real/40 bg-verdict-real/10 text-verdict-real",
  CONTRADICTED: "border-verdict-fake/40 bg-verdict-fake/10 text-verdict-fake",
  UNVERIFIED: "border-verdict-uncertain/40 bg-verdict-uncertain/10 text-verdict-uncertain",
};

function Chips({ items, tone }: { items: string[]; tone: "neutral" | "warn" | "good" }) {
  if (!items.length)
    return <p className="text-sm text-muted-foreground">None detected.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i, idx) => (
        <span
          key={`${i}-${idx}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs",
            tone === "warn" && "border-verdict-fake/35 bg-verdict-fake/10 text-verdict-fake",
            tone === "good" && "border-verdict-real/35 bg-verdict-real/10 text-verdict-real",
            tone === "neutral" && "border-border bg-secondary text-secondary-foreground",
          )}
        >
          {i}
        </span>
      ))}
    </div>
  );
}

function ClaimRow({ claim }: { claim: ClaimCheck }) {
  return (
    <li className="rounded-xl border border-border/70 bg-surface/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-[42rem] text-sm font-medium">{claim.claim}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            claimTone[claim.status],
          )}
        >
          {claimIcon[claim.status]}
          {claim.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{claim.evidence}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {claim.sourceUrl ? (
          <a
            href={claim.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" />
            {claim.sourceTitle ?? claim.sourceUrl}
          </a>
        ) : (
          <span>No source matched</span>
        )}
        <span>Relevance {claim.relevance}%</span>
      </div>
    </li>
  );
}

export function ResultDashboard({ result }: { result: AnalysisResult }) {
  const { text, image, factCheck, source } = result;

  return (
    <div className="space-y-6">
      {/* Verdict header */}
      <section className="surface-panel hero-glow animate-rise overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Final Verdict
            </p>
            <div className="mt-3">
              <VerdictBadge verdict={result.prediction} size="lg" />
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-lg font-semibold sm:text-xl">
              {result.headline}
            </h2>
            {result.createdAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Analysed {new Date(result.createdAt).toLocaleString()}
                {" · "}
                {result.modelMode === "full"
                  ? "Full multimodal pipeline"
                  : "Lightweight Model Mode"}
              </p>
            )}
          </div>
          <div className="grid w-full max-w-sm gap-4 sm:w-auto">
            <div className="flex gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Confidence
                </p>
                <p className="font-display text-3xl font-semibold">{result.confidence}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Risk level
                </p>
                <p className="font-display text-3xl font-semibold">{result.riskLevel}</p>
              </div>
            </div>
            <RiskMeter score={result.riskScore} level={result.riskLevel} />
          </div>
        </div>
      </section>

      {/* Score cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          label="Language Signal"
          score={result.scores.text}
          hint="Secondary context only · never decides factual truth"
        />
        <ScoreCard
          label="Image Credibility"
          score={result.scores.image}
          hint={`Vision head · weight ${result.fusionWeights["image"] ?? 0}%`}
        />
        <ScoreCard
          label="Source Credibility"
          score={result.scores.source}
          hint={`Domain heuristics · weight ${result.fusionWeights["source"] ?? 0}%`}
        />
        <ScoreCard
          label="Evidence Support"
          score={result.scores.evidence}
          hint={`Retrieved evidence · weight ${result.fusionWeights["evidence"] ?? 0}%`}
        />
      </div>

      {/* Recommendation */}
      <section
        className={cn(
          "surface-panel flex items-start gap-4 p-5",
          result.prediction === "FAKE" && "border-verdict-fake/40",
          result.prediction === "REAL" && "border-verdict-real/40",
          result.prediction === "UNCERTAIN" && "border-verdict-uncertain/40",
        )}
      >
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-display font-semibold">
            Publication recommendation — {result.recommendation.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{result.recommendation.body}</p>
        </div>
      </section>

      {/* Explanation */}
      <Panel
        title="Why did TruthGuard AI reach this conclusion?"
        icon={<Sparkles className="size-4" />}
        description="Generated from the actual pipeline outputs — token attributions, retrieved evidence and source heuristics."
      >
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          {result.explanation.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Panel>

      {/* Text analysis */}
      <Panel
        title="Text Analysis"
        icon={<ScrollText className="size-4" />}
        description={`Language-pattern estimate ${text.prediction} · confidence ${text.confidence}% · mode ${
          text.mode === "transformer" ? "transformer classifier" : "lightweight rule scorer"
        } · not the factual verdict`}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Important tokens (attribution weights)</p>
            {text.importantTokens.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {text.importantTokens.map((t, i) => (
                  <span
                    key={`${t.token}-${i}`}
                    title={`weight ${(t.weight * 100).toFixed(0)}%`}
                    className={cn(
                      "rounded-md border px-2.5 py-1",
                      t.direction === "suspicious"
                        ? "border-verdict-fake/40 bg-verdict-fake/10 text-verdict-fake"
                        : "border-verdict-real/40 bg-verdict-real/10 text-verdict-real",
                    )}
                    style={{
                      fontSize: `${0.75 + t.weight * 0.5}rem`,
                      opacity: 0.55 + t.weight * 0.45,
                    }}
                  >
                    {t.token}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No token attributions produced.</p>
            )}

            <p className="mt-5 mb-2 text-sm font-medium">Suspicious phrases</p>
            <Chips items={text.suspiciousPhrases} tone="warn" />

            <p className="mt-5 mb-2 text-sm font-medium">Sentiment</p>
            <p className="text-sm text-muted-foreground">{text.sentiment}</p>
          </div>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Linguistic patterns</p>
              <Chips items={text.linguisticPatterns} tone="neutral" />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Claim indicators</p>
              <Chips items={text.claimIndicators} tone="neutral" />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Sensationalism indicators</p>
              <Chips items={text.sensationalismIndicators} tone="warn" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 rounded-xl border border-border/70 bg-surface/60 p-4 text-xs sm:grid-cols-3">
              <Stat label="Words" value={text.features.wordCount} />
              <Stat label="Caps ratio" value={text.features.capsRatio} />
              <Stat label="Exclamations" value={text.features.exclamationCount} />
              <Stat label="Numeric claims" value={text.features.numericClaims} />
              <Stat label="Quotes" value={text.features.quoteCount} />
              <Stat label="Attributions" value={text.features.attributionTerms.length} />
            </div>
          </div>
        </div>
      </Panel>

      {/* Image analysis */}
      <Panel
        title="Image Analysis"
        icon={<ImageIcon className="size-4" />}
        description={
          image.available
            ? "Computer-vision assessment of manipulation indicators and text/image consistency."
            : "Image Analysis: Not Available"
        }
      >
        {image.available ? (
          <div className="grid gap-6 md:grid-cols-[minmax(0,260px)_1fr]">
            {image.previewUrl ? (
              <img
                src={image.previewUrl}
                alt="Uploaded news image under analysis"
                loading="lazy"
                className="w-full rounded-xl border border-border object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                Preview unavailable
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    image.status === "AUTHENTIC-LOOKING"
                      ? "border-verdict-real/40 bg-verdict-real/10 text-verdict-real"
                      : image.status === "SUSPICIOUS"
                        ? "border-verdict-fake/40 bg-verdict-fake/10 text-verdict-fake"
                        : "border-verdict-uncertain/40 bg-verdict-uncertain/10 text-verdict-uncertain",
                  )}
                >
                  {image.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  Image score: {image.score !== null ? `${image.score}/100` : "Not Available"} ·
                  Suspicion: {image.suspicionLevel}
                </span>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Visual indicators</p>
                <Chips items={image.indicators} tone="neutral" />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Text / image consistency</p>
                <p className="text-sm text-muted-foreground">{image.consistency}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Explanation</p>
                <p className="text-sm text-muted-foreground">{image.explanation}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Image forensics is indicative only — it never proves authenticity or manipulation.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No image was supplied with this submission, so the vision head was skipped and the
            fusion layer re-weighted the remaining signals.
          </p>
        )}
      </Panel>

      {/* Fact verification */}
      <Panel
        title="Fact Verification"
        icon={<BrainCircuit className="size-4" />}
        description="Claims are extracted from the submission and checked strictly against live retrieved sources."
      >
        {factCheck.available ? (
          <ul className="space-y-3">
            {factCheck.claims.map((c, i) => (
              <ClaimRow key={i} claim={c} />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-verdict-uncertain/40 bg-verdict-uncertain/10 p-4 text-sm text-verdict-uncertain">
            {factCheck.message ?? "External verification unavailable."}
          </div>
        )}
      </Panel>

      {/* Source credibility */}
      <Panel
        title="Source Credibility"
        icon={<Globe className="size-4" />}
        description="Only metadata you supplied is shown. Nothing is inferred or invented."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Field label="Domain" value={source.domain} />
            <Field
              label="HTTPS"
              value={source.https === null ? null : source.https ? "Yes" : "No"}
            />
            <Field label="Source name" value={source.sourceName} />
            <Field label="Author" value={source.author} />
            <Field label="Publication date" value={source.publicationDate} />
            <Field
              label="Credibility score"
              value={source.score !== null ? `${source.score}/100` : null}
            />
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {source.notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="py-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-display text-base font-semibold">{value}</p>
    </div>
  );
}
