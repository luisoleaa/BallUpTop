"use client";

// Signup shows a "check your email" state instead of signing in directly,
// since Supabase requires email confirmation. `?reason=rate`/`?reason=diary`
// show a contextual banner and route back to the right place after sign-in.
import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authAction, type AuthActionState } from "@/lib/actions/auth";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

const initialState: AuthActionState = {};

function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [state, formAction, pending] = useActionState(authAction, initialState);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const redirectTo = reason === "diary" ? "/diary" : "/";

  if (mode === "up" && state.checkEmail) {
    return (
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 8px", color: "var(--text)" }}>
          Check your email
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.5, margin: "0 0 26px" }}>
          We sent a confirmation link. Click it, then come back here and sign in.
        </p>
        <Button size="lg" fullWidth onClick={() => setMode("in")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      {reason && (
        <div style={{
          background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: 13,
          padding: "12px 16px", marginBottom: 20, fontSize: 14, fontWeight: 600, color: "var(--accent-strong)",
          display: "flex", alignItems: "center", gap: 9,
        }}>
          <Icon name="pen" size={16} stroke="var(--accent-strong)" />
          {reason === "rate" ? "Sign in to rate and review matches." : "Sign in to see your diary."}
        </div>
      )}
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 8px", color: "var(--text)" }}>
        {mode === "in" ? "Welcome back" : "Create an account"}
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.5, margin: "0 0 26px" }}>
        {mode === "in"
          ? "Sign in to log matches, write reviews, and keep your diary."
          : "Create an account to log matches, write reviews, and keep your diary."}
      </p>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Field label="Email" type="email" name="email" placeholder="you@example.com" />
        <Field label="Password" type="password" name="password" placeholder="••••••••" />
        {state.error && (
          <p style={{ color: "#ff6b6b", fontSize: 13.5, margin: 0 }}>{state.error}</p>
        )}
        <Button type="submit" size="lg" fullWidth disabled={pending} style={{ marginTop: 4 }}>
          {pending ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-muted)", margin: "22px 0 0" }}>
        {mode === "in" ? (
          <>
            New here?{" "}
            <button
              type="button" onClick={() => setMode("up")}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--accent-strong)", fontWeight: 700, fontSize: 13.5, textDecoration: "underline" }}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button" onClick={() => setMode("in")}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--accent-strong)", fontWeight: 700, fontSize: 13.5, textDecoration: "underline" }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-muted)", margin: "10px 0 0" }}>
        Just browsing?{" "}
        <Link href="/" style={{ color: "var(--accent-strong)", fontWeight: 700, fontSize: 13.5, textDecoration: "underline" }}>
          Continue without an account
        </Link>
      </p>
    </div>
  );
}

export function LoginClient() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--auth-bg)", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px" }}>
      <div style={{ width: "100%", maxWidth: 1160, padding: "20px 4px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <Logo size={30} />
          <span style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", letterSpacing: -0.6 }}>Ball Up Top</span>
        </Link>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", width: "100%", justifyContent: "center", paddingBottom: 60 }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

function Field({
  label, type, name, placeholder,
}: {
  label: string; type: string; name: string; placeholder: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <Label>{label}</Label>
      <input
        type={type} name={name} placeholder={placeholder} required
        className="bw-field"
        style={{
          height: 50, borderRadius: 13, border: "1px solid var(--border)", background: "var(--surface)",
          padding: "0 16px", fontSize: 15.5, color: "var(--text)", fontFamily: "inherit",
        }}
      />
    </label>
  );
}
