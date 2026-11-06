import {
  getLiveChatMessages,
  getLiveRatingPulses,
} from "@/lib/queries/live-activity";
import { resolveMatchStatus } from "@/lib/match-status-cache";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // `since`/`messagesSince` let a poller fetch only pulses/messages newer
  // than the last one it already holds, instead of the full match history
  // every 5s -- see lib/queries/live-activity.ts's getLiveRatingPulses /
  // getLiveChatMessages.
  const searchParams = new URL(req.url).searchParams;
  const since = searchParams.get("since") ?? undefined;
  const messagesSince = searchParams.get("messagesSince") ?? undefined;
  try {
    // Cache-first: a viewer's repeated 5s polls don't each re-hit the
    // external provider -- only a cache miss/stale row does, and the
    // write-side cache failure is already isolated inside
    // resolveMatchStatus, so it can never turn this otherwise-successful
    // fetch into a 500.
    const [status, messages, pulses] = await Promise.all([
      resolveMatchStatus(id),
      getLiveChatMessages(id, messagesSince),
      getLiveRatingPulses(id, since),
    ]);
    if (!status) return Response.json({ error: "Not found" }, { status: 404 });

    return Response.json({ status, messages, pulses });
  } catch {
    return Response.json(
      { error: "Failed to fetch live activity" },
      { status: 500 },
    );
  }
}
