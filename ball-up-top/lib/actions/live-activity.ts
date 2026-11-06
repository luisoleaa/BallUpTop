"use server";

// Mutations for live_chat_messages / live_rating_pulses. Both return
// {result} | {error} rather than redirect()-ing -- these are inline tap/type
// interactions on the match page that must never navigate away, same
// convention as toggleReviewLikeAction in lib/actions/review-likes.ts.
import { createClient } from "@/lib/supabase/server";
import { resolveMatchStatus } from "@/lib/match-status-cache";
import type { LiveChatMessage, LiveRatingPulse } from "@/lib/types";

const CHAT_MAX_LEN = 240;

// Postgres error code raised by the live_rating_pulses_cooldown /
// live_chat_messages_cooldown triggers (supabase/migrations/
// 20261007000003_add_pulse_cooldown_trigger.sql,
// 20261007000006_add_chat_cooldown_trigger.sql) -- the sole cooldown
// enforcement (atomic, pg_advisory_xact_lock-guarded); there is no
// app-layer pre-check, since a Date.now()-based one here would compare
// against the app server's clock instead of the DB's.
const COOLDOWN_TRIGGER_ERRCODE = "P0001";

// Postgres error code for an RLS policy violation -- surfaced here when
// match_status_cache's write (lib/match-status-cache.ts's syncMatchStatusCache)
// has failed (e.g. a misconfigured SUPABASE_SERVICE_ROLE_KEY) so the RLS
// freshness check in 20261007000002_require_live_status_for_inserts.sql
// rejects the insert even though assertMatchIsLive approved it.
const RLS_POLICY_VIOLATION_ERRCODE = "42501";
const LIVE_ACTIVITY_UNAVAILABLE_MESSAGE =
  "Live activity is temporarily unavailable — try again in a moment.";

// Re-resolves the match fresh (cache-first, via resolveMatchStatus) rather
// than trusting a client-supplied status -- that's trivially spoofable and
// is exactly the check that matters. This is a friendlier failure path on
// top of RLS's own live-status check, same philosophy as saveRatingAction's
// getUser() check being "just" a friendlier failure path over RLS ownership.
async function assertMatchIsLive(matchId: string): Promise<string | null> {
  const status = await resolveMatchStatus(matchId);
  if (status !== "live") {
    return "This match isn't live anymore — new activity can't be added.";
  }
  return null;
}

// Translates the DB cooldown trigger's error into a friendly message, the
// RLS freshness-policy violation into a friendly "try again" message, or
// passes through any other insert error unchanged.
function cooldownAwareError(
  error: { code?: string; message: string },
  cooldownMessage: string,
): string {
  if (error.code === COOLDOWN_TRIGGER_ERRCODE) return cooldownMessage;
  if (error.code === RLS_POLICY_VIOLATION_ERRCODE) {
    return LIVE_ACTIVITY_UNAVAILABLE_MESSAGE;
  }
  return error.message;
}

export async function postLiveChatMessageAction(
  matchId: string,
  message: string,
): Promise<{ message: LiveChatMessage } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to chat." };

  const trimmed = message.trim();
  if (!trimmed || trimmed.length > CHAT_MAX_LEN) {
    return { error: `Message must be 1-${CHAT_MAX_LEN} characters.` };
  }

  const liveError = await assertMatchIsLive(matchId);
  if (liveError) return { error: liveError };

  const chatCooldownMessage = "Hold on a sec before sending another message.";

  const { data, error } = await supabase
    .from("live_chat_messages")
    .insert({ match_id: matchId, user_id: user.id, message: trimmed })
    .select("id,created_at")
    .single();
  if (error) {
    return { error: cooldownAwareError(error, chatCooldownMessage) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    message: {
      id: data.id as string,
      matchId,
      userName: (profile?.display_name as string) ?? "Fan",
      message: trimmed,
      createdAt: data.created_at as string,
    },
  };
}

export async function submitRatingPulseAction(
  matchId: string,
  rating: number,
): Promise<{ pulse: LiveRatingPulse } | { error: string }> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return { error: "Rating must be an integer from 1 to 10." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to pulse-rate." };

  const liveError = await assertMatchIsLive(matchId);
  if (liveError) return { error: liveError };

  const pulseCooldownMessage = "Hold on a sec before pulsing again.";

  const { data, error } = await supabase
    .from("live_rating_pulses")
    .insert({ match_id: matchId, user_id: user.id, rating })
    .select("id,created_at")
    .single();
  if (error) {
    return { error: cooldownAwareError(error, pulseCooldownMessage) };
  }

  return {
    pulse: {
      id: data.id as string,
      matchId,
      rating,
      createdAt: data.created_at as string,
    },
  };
}
