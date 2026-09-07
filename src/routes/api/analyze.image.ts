import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fail, json } from "@/lib/api-shared.server";
import { analyzeImage } from "@/lib/pipeline.server";
import { parseImageDataUrl } from "@/lib/storage.server";

const schema = z.object({
  headline: z.string().trim().max(500).optional().default(""),
  imageDataUrl: z.string().max(15_000_000),
});

export const Route = createFileRoute("/api/analyze/image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = schema.safeParse(await request.json());
          if (!parsed.success) return fail("An image payload is required.", 422);
          const img = parseImageDataUrl(parsed.data.imageDataUrl);
          return json(await analyzeImage(img.dataUrl, parsed.data.headline));
        } catch (err) {
          console.error("[/api/analyze/image]", err);
          return fail(err instanceof Error ? err.message : "Image analysis failed.", 400);
        }
      },
    },
  },
});
