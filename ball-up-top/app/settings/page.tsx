import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/queries/profiles";
import { toUser } from "@/lib/to-user";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const authUser = await getUser();
  if (!authUser) redirect("/login?reason=settings");

  const user = toUser(authUser)!;
  const displayName = await getDisplayName(user.id);

  return <SettingsClient email={user.email} displayName={displayName ?? user.name} />;
}
