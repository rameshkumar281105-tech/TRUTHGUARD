import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fail, json } from "@/lib/api-shared.server";

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from("analyses")
            .select("prediction, confidence, risk_score, created_at, model_mode")
            .order("created_at", { ascending: false })
            .limit(1000);
          if (error) return fail(error.message, 500);

          const rows = data ?? [];
          const count = (p: string) => rows.filter((r) => r.prediction === p).length;
          const avg = (nums: number[]) =>
            nums.length ? +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : 0;

          const byDay = new Map<string, { date: string; REAL: number; FAKE: number; UNCERTAIN: number }>();
          for (const r of rows) {
            const day = String(r.created_at).slice(0, 10);
            const entry = byDay.get(day) ?? { date: day, REAL: 0, FAKE: 0, UNCERTAIN: 0 };
            entry[r.prediction as "REAL" | "FAKE" | "UNCERTAIN"] += 1;
            byDay.set(day, entry);
          }

          return json({
            total: rows.length,
            real: count("REAL"),
            fake: count("FAKE"),
            uncertain: count("UNCERTAIN"),
            avgConfidence: avg(rows.map((r) => Number(r.confidence))),
            avgRisk: avg(rows.map((r) => Number(r.risk_score))),
            lightweightRuns: rows.filter((r) => r.model_mode === "lightweight").length,
            activity: Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)),
          });
        } catch (err) {
          console.error("[/api/stats]", err);
          return fail("Could not load statistics.", 500);
        }
      },
    },
  },
});
