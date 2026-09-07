import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { json } from "@/lib/api-shared.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        let database = false;

        try {
          const { error } = await supabaseAdmin
            .from("analyses")
            .select("id", { head: true, count: "exact" });

          database = !error;
        } catch {
          database = false;
        }

        const aiGateway = Boolean(process.env["GEMINI_API_KEY"]);

        return json({
          status: database ? "online" : "degraded",
          database,
          aiGateway,
          modelMode: aiGateway ? "full" : "lightweight",
          time: new Date().toISOString(),
        });
      },
    },
  },
});