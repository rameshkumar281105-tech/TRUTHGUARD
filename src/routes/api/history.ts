import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fail, json } from "@/lib/api-shared.server";

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const q = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
          const verdict = url.searchParams.get("verdict");
          const sort = url.searchParams.get("sort") ?? "newest";
          const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
          const perPage = Math.min(50, Math.max(5, Number(url.searchParams.get("perPage") ?? 10) || 10));

          let query = supabaseAdmin
            .from("analyses")
            .select("id, headline, prediction, confidence, risk_score, created_at, source_name", {
              count: "exact",
            });

          if (q) query = query.ilike("headline", `%${q.replace(/[%_]/g, "")}%`);
          if (verdict && ["REAL", "FAKE", "UNCERTAIN"].includes(verdict))
            query = query.eq("prediction", verdict);

          const order: Record<string, [string, boolean]> = {
            newest: ["created_at", false],
            oldest: ["created_at", true],
            risk_desc: ["risk_score", false],
            risk_asc: ["risk_score", true],
            confidence_desc: ["confidence", false],
          };
          const [col, asc] = order[sort] ?? ["created_at", false];
          query = query.order(col, { ascending: asc });

          const from = (page - 1) * perPage;
          const { data, error, count } = await query.range(from, from + perPage - 1);
          if (error) return fail(error.message, 500);

          return json({ items: data ?? [], total: count ?? 0, page, perPage });
        } catch (err) {
          console.error("[/api/history]", err);
          return fail("Could not load history.", 500);
        }
      },
    },
  },
});
