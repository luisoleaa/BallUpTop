"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function followAction(
  targetId: string,
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    redirect(
      `/login?reason=rate&from=${encodeURIComponent(`/users/${targetId}`)}`,
    );

  const { success } = await checkRateLimit("action", user.id);
  if (!success) return { error: "Too many requests. Try again in a minute." };

  if (user.id === targetId) return { error: "You can't follow yourself." };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, followee_id: targetId });
  if (error) return { error: "Couldn't follow this user." };

  revalidatePath(`/users/${targetId}`);
  revalidatePath(`/users/${user.id}`);
  return { ok: true };
}

export async function unfollowAction(
  targetId: string,
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    redirect(
      `/login?reason=rate&from=${encodeURIComponent(`/users/${targetId}`)}`,
    );

  const { success } = await checkRateLimit("action", user.id);
  if (!success) return { error: "Too many requests. Try again in a minute." };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("followee_id", targetId);
  if (error) return { error: "Couldn't unfollow this user." };

  revalidatePath(`/users/${targetId}`);
  revalidatePath(`/users/${user.id}`);
  return { ok: true };
}
