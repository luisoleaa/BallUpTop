import { createClient } from "@/lib/supabase/server";

export async function getDisplayName(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();
  return data?.display_name ?? null;
}
