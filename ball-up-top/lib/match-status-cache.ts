// Reads/writes public.match_status_cache -- the DB-resident source of truth
// RLS checks on live_chat_messages/live_rating_pulses rely on (see
// supabase/migrations/20261007000001_create_match_status_cache.sql).
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAnyMatch } from "@/lib/queries/matches";
import type { MatchStatus } from "@/lib/types";

// Fresh-enough cached status, or null on a miss/stale row. The freshness
// comparison happens entirely in Postgres (via the RPC below), not in app
// code -- this keeps it on the same clock as the RLS policies in
// supabase/migrations/20261007000002_require_live_status_for_inserts.sql,
// which do the identical `updated_at > now() - interval '15 seconds'` check
// DB-side. See supabase/migrations/20261009000001_add_get_fresh_match_status_rpc.sql
// -- that interval is duplicated (not shared) across this RPC and the RLS
// policies, since SQL migrations can't import TS constants and the policies'
// migration is already applied, immutable history.
export async function getFreshCachedStatus(
  matchId: string,
): Promise<MatchStatus | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_fresh_match_status", {
    p_match_id: matchId,
  });
  if (error) {
    console.error("get_fresh_match_status RPC failed", error);
    return null;
  }
  return (data as MatchStatus | null) ?? null;
}

// The only place match_status_cache is ever written. Only call this with a
// status the caller just independently resolved via getAnyMatch -- never
// with client-supplied input, since the service role bypasses RLS.
//
// updated_at is deliberately NOT set here -- a
// before-insert-or-update trigger (supabase/migrations/
// 20261007000007_force_match_status_cache_updated_at.sql) always overwrites
// it with the DB's own now(). The RLS freshness checks that read this column
// also compare against Postgres's now(), so if this app server's clock ever
// drifted from the DB's, a value written from `new Date()` here could look
// stale (or fresh) by the wrong amount from RLS's point of view. Letting the
// trigger set it keeps both sides of the freshness check on the same clock.
export async function syncMatchStatusCache(
  matchId: string,
  status: MatchStatus,
): Promise<void> {
  const service = createServiceClient();
  await service
    .from("match_status_cache")
    .upsert({ match_id: matchId, status }, { onConflict: "match_id" });
}

// De-dupes concurrent cache-miss resolutions of the same match within this
// process: without it, every poller hitting a stale/expired cache row at
// once (e.g. right at the 15s TTL boundary) independently re-fetches from
// the external provider and re-upserts the cache. This only collapses calls
// within one Node process/instance -- it does not prevent a stampede across
// separate instances (e.g. multiple serverless invocations), since each
// still makes its own request on a miss. A cross-instance fix would need a
// distributed lock (e.g. a Postgres advisory lock); not done here since this
// already removes the dominant redundant-fetch case for a fraction of the
// complexity.
const inFlightResolutions = new Map<string, Promise<MatchStatus | null>>();

// Cache-first resolution shared by every live-activity read/write path, so
// there's exactly one mechanism deciding "is this match live" without
// hitting the external provider on every call. On a cache hit, returns
// immediately with no provider call. On a miss/stale row, resolves fresh via
// getAnyMatch and best-effort re-syncs the cache -- a failure to WRITE the
// cache (e.g. a misconfigured SUPABASE_SERVICE_ROLE_KEY) must not fail
// status resolution itself: the caller already has a correct answer from
// getAnyMatch, and RLS will simply keep rejecting live-only inserts until
// the cache write starts succeeding again.
export async function resolveMatchStatus(
  matchId: string,
): Promise<MatchStatus | null> {
  const cached = await getFreshCachedStatus(matchId);
  if (cached) return cached;

  const existing = inFlightResolutions.get(matchId);
  if (existing) return existing;

  const promise = (async () => {
    const match = await getAnyMatch(matchId);
    const status = match?.status ?? null;
    // Only "live"/"final" are cached -- "upcoming" is deliberately never
    // written, so an upcoming->live transition is always a cache miss and
    // re-resolves fresh via getAnyMatch instead of serving a stale
    // "upcoming" for up to the cache's freshness window right when
    // engagement is highest (the first chat/pulse at kickoff).
    if (status && status !== "upcoming") {
      try {
        await syncMatchStatusCache(matchId, status);
      } catch (err) {
        console.error(
          `syncMatchStatusCache failed for match ${matchId} (status=${status}) -- ` +
            "live chat/pulse inserts will likely be rejected by RLS until this succeeds",
          err,
        );
      }
    }
    return status;
  })();

  inFlightResolutions.set(matchId, promise);
  try {
    return await promise;
  } finally {
    inFlightResolutions.delete(matchId);
  }
}
