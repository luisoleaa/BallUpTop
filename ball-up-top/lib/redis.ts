import { Redis } from "@upstash/redis";

// Shared server-only Upstash Redis (REST) client. Backs lib/rate-limit.ts's
// throttling and the short-TTL cache in front of the live-data provider
// fan-out (routes/live/all_live.ts). Never import this where a
// client-supplied value could reach it unguarded.
export const redis = Redis.fromEnv();
