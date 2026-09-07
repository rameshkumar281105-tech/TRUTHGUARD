import { createFileRoute } from "@tanstack/react-router";
import { analyzeAndStore, analyzeSchema, fail, json } from "@/lib/api-shared.server";

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = analyzeSchema.safeParse(await request.json());
          if (!parsed.success)
            return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 422);
          const result = await analyzeAndStore(parsed.data);
          return json(result);
        } catch (err) {
          console.error("[/api/analyze]", err);
          return fail(err instanceof Error ? err.message : "Analysis failed.", 500);
        }
      },
    },
  },
});
