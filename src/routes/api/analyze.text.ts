import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fail, json } from "@/lib/api-shared.server";
import { analyzeText } from "@/lib/pipeline.server";

const schema = z.object({
  headline: z.string().trim().min(8).max(500),
  content: z.string().trim().max(20000).optional().default(""),
});

export const Route = createFileRoute("/api/analyze/text")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = schema.safeParse(await request.json());
          if (!parsed.success) return fail("Provide a headline of at least 8 characters.", 422);
          return json(await analyzeText(parsed.data.headline, parsed.data.content));
        } catch (err) {
          console.error("[/api/analyze/text]", err);
          return fail("Text analysis failed.", 500);
        }
      },
    },
  },
});
