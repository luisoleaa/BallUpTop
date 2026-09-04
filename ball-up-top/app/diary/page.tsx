// Redirects guests server-side, then fetches ratings for DiaryClient.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getUserRatings } from "@/lib/queries/ratings";
import { DiaryClient } from "@/components/diary/DiaryClient";

export const metadata: Metadata = { title: "Your diary" };

export default async function DiaryPage() {
  const user = await getUser();
  if (!user) redirect("/login?reason=diary");

  const ratings = await getUserRatings(user.id);

  return <DiaryClient ratings={ratings} />;
}
