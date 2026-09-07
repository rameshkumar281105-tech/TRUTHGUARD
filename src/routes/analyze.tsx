import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AlertCircle, Image as ImageIcon, Loader2, ShieldCheck, Trash2, Upload } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { api, type AnalyzePayload } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Content — TruthGuard AI" },
      {
        name: "description",
        content:
          "Submit a headline, article body, source metadata and image for real-time multimodal misinformation analysis.",
      },
      { property: "og:title", content: "Analyze Content — TruthGuard AI" },
      {
        property: "og:description",
        content: "Real-time pre-publication credibility analysis with live evidence retrieval.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

const stages = [
  "Tokenising and encoding text",
  "Running transformer credibility head",
  "Inspecting image for manipulation",
  "Extracting atomic claims",
  "Retrieving live evidence",
  "Fusing multimodal signals",
];

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function Label({ htmlFor, children, hint }: { htmlFor: string; children: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">
      {children}
      {hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25";

function AnalyzePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    headline: "",
    content: "",
    sourceUrl: "",
    sourceName: "",
    author: "",
    publicationDate: "",
  });
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [stage, setStage] = useState(0);

  const mutation = useMutation({
    mutationFn: async (payload: AnalyzePayload) => {
      setStage(0);
      const timer = setInterval(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 3500);
      try {
        return await api.analyze(payload);
      } finally {
        clearInterval(timer);
      }
    },
    onSuccess: (result) => {
      if (result.id) navigate({ to: "/result/$id", params: { id: result.id } });
    },
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function onFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Please choose an image file (PNG, JPG or WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFileError("Image is larger than 4 MB. Please upload a smaller file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      setImageName(file.name);
    };
    reader.onerror = () => setFileError("That file could not be read.");
    reader.readAsDataURL(file);
  }

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const canSubmit = form.headline.trim().length >= 8 && wordCount >= 20 && !mutation.isPending;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pre-publication check"
        title="Analyze content"
        description="Provide as much context as you can. Optional metadata is never invented — anything you leave blank is reported as Not Provided."
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <form
          className="surface-panel space-y-6 p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            mutation.mutate({
              headline: form.headline.trim(),
              content: form.content.trim(),
              sourceUrl: form.sourceUrl.trim() || undefined,
              sourceName: form.sourceName.trim() || undefined,
              author: form.author.trim() || undefined,
              publicationDate: form.publicationDate.trim() || undefined,
              imageDataUrl,
            });
          }}
        >
          <div>
            <Label htmlFor="headline">Headline</Label>
            <input
              id="headline"
              className={inputClass}
              placeholder="e.g. Health ministry announces nationwide vaccination drive"
              value={form.headline}
              onChange={set("headline")}
              required
              minLength={8}
            />
          </div>

          <div>
            <Label htmlFor="content" hint={`${wordCount} words · minimum 20`}>
              Article body
            </Label>
            <textarea
              id="content"
              rows={12}
              className={cn(inputClass, "resize-y font-sans leading-relaxed")}
              placeholder="Paste the full article text here…"
              value={form.content}
              onChange={set("content")}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="sourceUrl" hint="optional">
                Source URL
              </Label>
              <input
                id="sourceUrl"
                type="url"
                className={inputClass}
                placeholder="https://example.com/article"
                value={form.sourceUrl}
                onChange={set("sourceUrl")}
              />
            </div>
            <div>
              <Label htmlFor="sourceName" hint="optional">
                Source name
              </Label>
              <input
                id="sourceName"
                className={inputClass}
                placeholder="The Hindu"
                value={form.sourceName}
                onChange={set("sourceName")}
              />
            </div>
            <div>
              <Label htmlFor="author" hint="optional">
                Author
              </Label>
              <input
                id="author"
                className={inputClass}
                placeholder="Reporter name"
                value={form.author}
                onChange={set("author")}
              />
            </div>
            <div>
              <Label htmlFor="publicationDate" hint="optional">
                Publication date
              </Label>
              <input
                id="publicationDate"
                type="date"
                className={inputClass}
                value={form.publicationDate}
                onChange={set("publicationDate")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image" hint="optional · max 4 MB">
              Accompanying image
            </Label>
            <input
              ref={fileRef}
              id="image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {imageDataUrl ? (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3">
                <img
                  src={imageDataUrl}
                  alt="Selected upload preview"
                  className="size-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{imageName}</p>
                  <p className="text-xs text-muted-foreground">Will be analysed by the vision head</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageDataUrl(null);
                    setImageName(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" /> Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
              >
                <Upload className="size-5" />
                Click to upload an image
                <span className="text-xs">PNG, JPG or WebP</span>
              </button>
            )}
            {fileError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5" />
                {fileError}
              </p>
            )}
          </div>

          {mutation.isError && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Analysis failed</p>
                <p className="mt-1 opacity-90">{(mutation.error as Error).message}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Analysing…
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Run analysis
              </>
            )}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="surface-panel p-6">
            <h2 className="font-display text-lg font-semibold">Pipeline status</h2>
            <ol className="mt-4 space-y-3">
              {stages.map((s, i) => {
                const active = mutation.isPending && i === stage;
                const done = mutation.isPending ? i < stage : mutation.isSuccess;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        done
                          ? "bg-verdict-real"
                          : active
                            ? "bg-primary animate-pulse-dot"
                            : "bg-secondary",
                      )}
                    />
                    <span className={cn(active || done ? "text-foreground" : "text-muted-foreground")}>
                      {s}
                    </span>
                  </li>
                );
              })}
            </ol>
            {mutation.isPending && (
              <p className="mt-4 text-xs text-muted-foreground">
                Live retrieval takes 20–60 seconds. Please keep this tab open.
              </p>
            )}
          </div>

          <div className="surface-panel p-6 text-sm text-muted-foreground">
            <h2 className="font-display text-base font-semibold text-foreground">
              Tips for accurate results
            </h2>
            <ul className="mt-3 space-y-2">
              <li>• Paste the complete body — truncated text weakens claim extraction.</li>
              <li>• Add the source URL so domain credibility can be scored.</li>
              <li>• Upload the published image to enable the vision head.</li>
              <li>• Treat the verdict as decision support, not proof.</li>
            </ul>
          </div>

          <div className="surface-panel flex items-start gap-3 p-6 text-sm text-muted-foreground">
            <ImageIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Images are stored privately and rendered through short-lived signed links used only
              for your result view.
            </p>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
