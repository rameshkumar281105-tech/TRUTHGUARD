import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fail, json, loadAnalysis } from "@/lib/api-shared.server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/history/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!UUID.test(params.id)) return fail("Invalid id.", 400);
        const result = await loadAnalysis(params.id);
        if (!result) return fail("Analysis not found.", 404);
        return json(result);
      },
      DELETE: async ({ params }) => {
        if (!UUID.test(params.id)) return fail("Invalid id.", 400);
        const { error } = await supabaseAdmin.from("analyses").delete().eq("id", params.id);
        if (error) return fail(error.message, 500);
        return json({ deleted: true, id: params.id });
      },
    },
  },
});
