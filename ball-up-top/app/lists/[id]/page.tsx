// A list's detail page: public read, owner-only edit/delete (enforced for
// real by RLS, mirrored in the UI via isOwner).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getList, getListItems } from "@/lib/queries/lists";
import { getAnyMatch } from "@/lib/queries/matches";
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
  const matches = await Promise.all(
    listItems.map((i) => getAnyMatch(i.matchId)),
  );
  const items = listItems
    .map((i, idx) => ({ match: matches[idx], addedAt: i.addedAt }))
    .filter((x): x is { match: Match; addedAt: string } => Boolean(x.match));

  return (
    <ListDetailClient
      list={list}
      items={items}
      isOwner={viewer?.id === list.userId}
    />
  );
}
