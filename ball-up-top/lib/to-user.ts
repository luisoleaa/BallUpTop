// Shared by app/layout.tsx (server) and lib/app-store.tsx (client) so both
// map a Supabase auth user to this app's User shape the same way.
import type { User } from "./types";

interface SupabaseAuthUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

export function toUser(supaUser: SupabaseAuthUser | null): User | null {
  if (!supaUser) return null;
  const metaName = supaUser.user_metadata?.name;
  const name =
    (typeof metaName === "string" && metaName) ||
    (supaUser.email ? supaUser.email.split("@")[0] : "jordan");
  return { id: supaUser.id, name, email: supaUser.email ?? "" };
}
