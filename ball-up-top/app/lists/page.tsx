// Redirects guests server-side, then fetches the signed-in user's lists.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getListsForUser } from "@/lib/queries/lists";
import { ListsClient } from "@/components/lists/ListsClient";

export const metadata: Metadata = { title: "Your lists" };

export default async function ListsPage() {
  const user = await getUser();
  if (!user) redirect("/login?reason=rate&from=/lists");

  const lists = await getListsForUser(user.id);
  return <ListsClient lists={lists} />;
}
