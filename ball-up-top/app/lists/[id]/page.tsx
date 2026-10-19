// A list's detail page: public read, owner-only edit/delete (enforced for
// real by RLS, mirrored in the UI via isOwner).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getList, getListItems } from "@/lib/queries/lists";
import { getMatch } from "@/lib/data";
import { getRealMatchesForIds } from "@/lib/queries/matches";
import { getUser } from "@/lib/supabase/server";
import type { Match } from "@/lib/types";
import { ListDetailClient } from "@/components/lists/ListDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const list = await getList(id);
  return { title: list?.title ?? "List" };
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getList(id);
  if (!list) notFound();

  const [listItems, viewer] = await Promise.all([getListItems(id), getUser()]);

  // Batch real (non-mock) ids through one getRealMatchesForIds call per
  // sport provider, same pattern /users/[id] and /activity already use,
  // instead of one getAnyMatch round-trip per item.
  const realIds = listItems
    .map((i) => i.matchId)
    .filter((mid) => !getMatch(mid));
  const realMatches = await getRealMatchesForIds(realIds);
  const matchById = new Map<string, Match>([
    ...realMatches.map((m): [string, Match] => [m.id, m]),
    ...listItems.flatMap((i): [string, Match][] => {
      const mock = getMatch(i.matchId);
      return mock ? [[i.matchId, mock]] : [];
    }),
  ]);

  const items = listItems
    .map((i) => ({ match: matchById.get(i.matchId), addedAt: i.addedAt }))
    .filter((x): x is { match: Match; addedAt: string } => Boolean(x.match));

  return (
    <ListDetailClient
      list={list}
      items={items}
      isOwner={viewer?.id === list.userId}
    />
  );
}
