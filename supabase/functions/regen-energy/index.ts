// Edge function que dispara a regeneração de energia.
// Pode ser chamada por cron (pg_cron + pg_net) a cada 10 min.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase.rpc("regen_energy_tick");
  if (error) {
    console.error("regen error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ updated: data }), {
    headers: { "Content-Type": "application/json" },
  });
});
