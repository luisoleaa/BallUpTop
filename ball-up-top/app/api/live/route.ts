import { getAllLiveGames } from "@/routes/live/all_live";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const { success } = await checkRateLimit("live-api", await getClientIp());
  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const games = await getAllLiveGames();
    return Response.json({ games });
  } catch {
    return Response.json(
      { error: "Failed to fetch live games" },
      { status: 500 },
    );
  }
}
