import { createClient } from "@supabase/supabase-js";

// Service-role client for the one trusted server-only write this app makes:
// syncing match_status_cache (lib/match-status-cache.ts) with a status the
// server has already independently resolved via getAnyMatch. The service
// role bypasses RLS entirely -- never call this with a client-supplied
// value, and never import it from a Client Component. Previously
// SUPABASE_SERVICE_ROLE_KEY was scripts/-only (see .env.example); this is
// its first use inside a live request path, so it must also be set in the
// production host's env vars, not just .env.local.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
