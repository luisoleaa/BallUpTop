// Redirects guests server-side, then fetches ratings for DiaryClient.
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getUserRatings } from "@/lib/queries/ratings";
import { DiaryClient } from "@/components/diary/DiaryClient";

export default async function DiaryPage() {
  const user = await getUser();
  if (!user) redirect("/login?reason=diary");

  const ratings = await getUserRatings(user.id);

  return <DiaryClient ratings={ratings} />;
}
