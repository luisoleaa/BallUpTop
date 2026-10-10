-- The existing (match_id, created_at) index doesn't cover the cooldown
-- lookup/trigger, which filters by match_id AND user_id -- for a popular
-- live match with many pulse rows, that query can't seek directly without
-- this. Kept alongside the existing index rather than replacing it:
-- getLiveRatingPulses reads by match_id ordered by created_at alone, a
-- different shape that the (match_id, created_at) index still serves best.
create index if not exists live_rating_pulses_match_user_created_idx
  on public.live_rating_pulses (match_id, user_id, created_at);
