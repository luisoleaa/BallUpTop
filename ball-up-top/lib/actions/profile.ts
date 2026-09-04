"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ProfileActionState {
  error?: string;
  saved?: boolean;
}

export async function updateDisplayNameAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Enter a display name." };
  if (displayName.length > 40) return { error: "Keep it under 40 characters." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?reason=settings");

  // upsert, not update -- a user whose profiles row predates the
  // handle_new_user trigger (or who signed up before that trigger existed)
  // would otherwise have this silently no-op: an UPDATE matching zero rows
  // doesn't error, it would just report "Saved" without persisting anything.
  const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName });
  if (error) return { error: error.message };

  return { saved: true };
}

// Calls delete_own_account() -- a security definer RPC that deletes the
// caller's own auth.users row (cascades to ratings/profiles/etc via FK), so
// no service-role key is needed in app code. Requires that RPC to exist.
export async function deleteAccountAction() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
  redirect("/");
}
