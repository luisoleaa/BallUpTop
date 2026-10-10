"use server";

// Sign-in/sign-up via Supabase Auth. signUp doesn't return a session until
// the email is confirmed, so the caller gets checkEmail: true instead.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";

export interface AuthActionState {
  error?: string;
  checkEmail?: boolean;
}

export async function authAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const mode = formData.get("mode") === "up" ? "up" : "in";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter an email and password." };
  }

  const supabase = await createClient();

  if (mode === "up") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: email.split("@")[0] || "jordan" } },
    });
    if (error) return { error: error.message };
    return { checkEmail: true };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // authAction is a Server Action, directly POST-able -- it can be hit
  // without going through LoginClient.tsx's own safeRedirectPath check, so
  // the raw value must be re-validated here too, not just trusted.
  redirect(safeRedirectPath(String(formData.get("redirectTo") ?? "")) ?? "/");
}
