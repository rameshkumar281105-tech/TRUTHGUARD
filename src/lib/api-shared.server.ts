import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runPipeline } from "./pipeline.server";
import { parseImageDataUrl, storeImage, signedImageUrl } from "./storage.server";
import type { AnalysisResult } from "./analysis-types";

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const fail = (message: string, status = 400) => json({ error: message }, status);

export const analyzeSchema = z.object({
  headline: z.string().trim().min(8, "Headline must be at least 8 characters.").max(500),
  content: z.string().trim().max(20000).optional().default(""),
  sourceUrl: z.string().trim().max(500).optional().nullable(),
  sourceName: z.string().trim().max(200).optional().nullable(),
  author: z.string().trim().max(200).optional().nullable(),
  publicationDate: z.string().trim().max(40).optional().nullable(),
  imageDataUrl: z.string().max(15_000_000).optional().nullable(),
});

export type AnalyzeBody = z.infer<typeof analyzeSchema>;

export async function analyzeAndStore(body: AnalyzeBody): Promise<AnalysisResult> {
  let imagePath: string | null = null;
  let imageDataUrl: string | null = null;

  if (body.imageDataUrl) {
    const img = parseImageDataUrl(body.imageDataUrl);
    imageDataUrl = img.dataUrl;
    imagePath = await storeImage(img);
  }

  const result = await runPipeline({
    headline: body.headline,
    content: body.content,
    sourceUrl: body.sourceUrl ?? null,
    sourceName: body.sourceName ?? null,
    author: body.author ?? null,
    publicationDate: body.publicationDate ?? null,
    imageDataUrl,
  });

  const { data, error } = await supabaseAdmin
    .from("analyses")
    .insert({
      headline: result.headline,
      content: result.content,
      source_url: body.sourceUrl || null,
      source_name: body.sourceName || null,
      publication_date: body.publicationDate || null,
      image_path: imagePath,
      prediction: result.prediction,
      confidence: result.confidence,
      risk_score: result.riskScore,
      text_score: result.scores.text,
      image_score: result.scores.image,
      evidence_score: result.scores.evidence,
      source_score: result.scores.source,
      explanation: result.explanation,
      details: JSON.parse(JSON.stringify(result)),
      model_mode: result.modelMode,
    })
    .select("id, created_at")
    .single();

  if (error) console.error("[analyze] persist failed", error.message);

  return {
    ...result,
    ...(data?.id ? { id: data.id } : {}),
    ...(data?.created_at ? { createdAt: data.created_at } : {}),
    image: {
      ...result.image,
      previewUrl: imagePath ? await signedImageUrl(imagePath) : null,
    },
  };
}

export async function loadAnalysis(id: string): Promise<AnalysisResult | null> {
  const { data, error } = await supabaseAdmin
    .from("analyses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const details = data.details as unknown as AnalysisResult;
  return {
    ...details,
    id: data.id,
    createdAt: data.created_at,
    image: {
      ...details.image,
      previewUrl: await signedImageUrl(data.image_path),
    },
  };
}
