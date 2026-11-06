import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";

// Server-only. Throttles auth attempts, mutating Server Actions, and the
// live-data API routes -- never import this where a client-supplied value
// could pick the bucket or identifier, only where the caller already knows
// which bucket applies (e.g. a server-resolved user id).

const LIMITS = {
  // Sign-in/sign-up, keyed by IP -- no user id exists yet.
  auth: { requests: 5, window: "60 s" as const },
  // Mutating Server Actions once a user is known (ratings, follows, lists).
  action: { requests: 20, window: "60 s" as const },
  // Live-data API routes, keyed by IP -- legitimate polling is 1 req/30s.
  "live-api": { requests: 30, window: "60 s" as const },
};

type Bucket = keyof typeof LIMITS;

const limiters = new Map<Bucket, Ratelimit>();

function getLimiter(bucket: Bucket): Ratelimit {
  let limiter = limiters.get(bucket);
  if (!limiter) {
    const { requests, window } = LIMITS[bucket];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `ratelimit:${bucket}`,
    });
    limiters.set(bucket, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  bucket: Bucket,
  identifier: string,
): Promise<{ success: boolean }> {
  const { success } = await getLimiter(bucket).limit(identifier);
  return { success };
}

// x-forwarded-for can carry a comma-separated proxy chain -- the first
// entry is the original client, added by the host's edge (Vercel, etc).
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
