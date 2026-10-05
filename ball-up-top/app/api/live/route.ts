import { getAllLiveGames } from "@/routes/live/all_live";

export async function GET() {
  try {
    const games = await getAllLiveGames();
    return Response.json({ games });
  } catch {
    return Response.json({ error: "Failed to fetch live games" }, { status: 500 });
  }
}
