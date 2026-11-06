// Server-side reads for live_chat_messages / live_rating_pulses. Mutations
// live in lib/actions/live-activity.ts.
import { createClient } from "@/lib/supabase/server";
import { getDisplayNamesByUserId } from "@/lib/queries/profiles";
import type { LiveChatMessage, LiveRatingPulse } from "@/lib/types";

// Recency-biased cap -- old chat isn't used in any aggregate, unlike pulses.
const CHAT_SCROLLBACK_LIMIT = 300;

// Chat messages, oldest first. live_chat_messages.user_id has no direct FK
// to profiles (both point at auth.users), so profiles are fetched
// separately and merged in app code -- same pattern as getMatchReviews in
// lib/queries/ratings.ts. Falls back to "Fan" for a user with no profile row.
//
// `since` mirrors getLiveRatingPulses': an incremental poller passes the
// last message it already has and gets back only new ones (no scrollback
// limit needed for a delta), instead of re-fetching the full 300-row
// scrollback + profile join every 5s regardless of whether anything new was
// posted. The initial page-load call omits it to get the normal capped
// scrollback. `.gte()`, not `.gt()`, for the same reason as the pulses
// query -- two messages can share a created_at, and the caller's id-keyed
// merge makes re-receiving a row harmless.
export async function getLiveChatMessages(
  matchId: string,
  since?: string,
): Promise<LiveChatMessage[]> {
  const supabase = await createClient();
  const base = supabase
    .from("live_chat_messages")
    .select("id,match_id,user_id,message,created_at")
    .eq("match_id", matchId);

  let rows: {
    id: string;
    match_id: string;
    user_id: string;
    message: string;
    created_at: string;
  }[];
  if (since) {
    // Capped too, same as the no-`since` path below -- a tab backgrounded
    // through a long stretch of a high-traffic match resumes polling with a
    // very old `since` cursor, and without a cap that single delta fetch
    // would return unbounded rows instead of the scrollback-sized catch-up
    // this is meant to be.
    const { data, error } = await base
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(CHAT_SCROLLBACK_LIMIT);
    if (error) throw new Error(error.message);
    rows = (data ?? []).slice().reverse();
  } else {
    const { data, error } = await base
      .order("created_at", { ascending: false })
      .limit(CHAT_SCROLLBACK_LIMIT);
    if (error) throw new Error(error.message);
    rows = (data ?? []).slice().reverse();
  }
  if (rows.length === 0) return [];

  const nameById = await getDisplayNamesByUserId(
    rows.map((r) => r.user_id as string),
  );

  return rows.map((r) => ({
    id: r.id as string,
    matchId: r.match_id as string,
    userName: nameById.get(r.user_id as string) ?? "Fan",
    message: r.message as string,
    createdAt: r.created_at as string,
  }));
}

// Recent-history cap on the no-`since` path, mirroring CHAT_SCROLLBACK_LIMIT
// above -- without it, a long, high-traffic live match's full pulse history
// (fetched on every page load and re-bucketed on every poll) grows
// unbounded, risking a stack-overflow in pulseBuckets.ts's min/max scan well
// before it's a pure performance problem.
const PULSE_HISTORY_LIMIT = 300;

// Pulse history for a match, oldest first -- the rating-over-time chart
// buckets across the whole observed timespan (first pulse to last). `since`
// lets a poller fetch only pulses at-or-after the last one it already has,
// instead of re-fetching history every 5s; the initial page-load call omits
// it to get the (capped) history the chart needs. No profile merge: the
// chart is anonymous/aggregate.
//
// Deliberately `.gte()`, not `.gt()`: two pulses from different users can
// land with an identical created_at (timestamptz has finite precision), and
// a strict `.gt()` against the caller's last-seen timestamp would silently
// and permanently drop any pulse sharing that exact value once the cursor
// advances past it. `.gte()` can re-return the boundary pulse(s) the caller
// already has, which is harmless -- the caller merges results into state
// keyed by id, so re-receiving the same row is a no-op.
export async function getLiveRatingPulses(
  matchId: string,
  since?: string,
): Promise<LiveRatingPulse[]> {
  const supabase = await createClient();
  const base = supabase
    .from("live_rating_pulses")
    .select("id,match_id,rating,created_at")
    .eq("match_id", matchId);

  let rows: {
    id: string;
    match_id: string;
    rating: number;
    created_at: string;
  }[];
  if (since) {
    // Capped too, same as the no-`since` path below -- see the matching
    // comment in getLiveChatMessages above.
    const { data, error } = await base
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(PULSE_HISTORY_LIMIT);
    if (error) throw new Error(error.message);
    rows = (data ?? []).slice().reverse();
  } else {
    const { data, error } = await base
      .order("created_at", { ascending: false })
      .limit(PULSE_HISTORY_LIMIT);
    if (error) throw new Error(error.message);
    rows = (data ?? []).slice().reverse();
  }

  return rows.map((r) => ({
    id: r.id as string,
    matchId: r.match_id as string,
    rating: Number(r.rating),
    createdAt: r.created_at as string,
  }));
}
