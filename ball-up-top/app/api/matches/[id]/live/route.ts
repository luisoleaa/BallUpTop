import { getAnyMatch } from "@/lib/queries/matches";

// Polled client-side by MatchDetailClient for a real (non-mock) match whose
// status is "live" -- getAnyMatch already resolves mock ids first and real
// provider ids second, so this is just that same resolution exposed for the
// client poll rather than a second lookup path.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const match = await getAnyMatch(id);
    if (!match) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ match });
  } catch {
    return Response.json({ error: "Failed to fetch match" }, { status: 500 });
  }
}
