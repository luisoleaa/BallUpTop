"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/app-store";
import { Icon } from "./Icon";

function WebLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", flexShrink: 0 }}>
      <path d="M6 32 Q14 10 28 12" stroke="var(--accent-strong)" strokeWidth="2.4" strokeDasharray="0.5 6" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="12" r="7" fill="var(--accent-strong)" />
      <path d="M30 5v14M23 12h14M25.2 7.2q4.8 4.8 0 9.6M34.8 7.2q-4.8 4.8 0 9.6" stroke="var(--bg)" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const { signIn, showToast } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const name = email.trim() ? email.trim().split("@")[0] : "jordan";
    signIn({ name, email: email.trim() || "jordan@example.com" });
    showToast(`Signed in as ${name}`);
    router.push(reason === "diary" ? "/diary" : "/");
  };

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
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 8px", color: "var(--text)" }}>Welcome back</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.5, margin: "0 0 26px" }}>
        Sign in to log matches, write reviews, and keep your diary.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Email" type="email" value={email} setValue={setEmail} placeholder="you@example.com" />
        <Field label="Password" type="password" value={pw} setValue={setPw} placeholder="••••••••" />
        <button type="submit" style={{
          height: 52, borderRadius: 14, border: "none", background: "var(--accent)",
          color: "var(--accent-text)", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginTop: 4,
        }}>Sign in</button>
      </form>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>
      <button onClick={() => submit()} style={{
        width: "100%", height: 52, borderRadius: 14, border: "1px solid var(--border)",
        background: "var(--surface)", color: "var(--text)", fontSize: 15.5, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <Icon name="apple" size={19} stroke="var(--text)" />
        Continue with Apple
      </button>
      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-muted)", margin: "22px 0 0" }}>
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
          <WebLogo size={30} />
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
  label, type, value, setValue, placeholder,
}: {
  label: string; type: string; value: string; setValue: (v: string) => void; placeholder: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", letterSpacing: 0.4, textTransform: "uppercase" }}>
        {label}
      </span>
      <input
        type={type} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
        style={{
          height: 50, borderRadius: 13, border: "1px solid var(--border)", background: "var(--surface)",
          padding: "0 16px", fontSize: 15.5, color: "var(--text)", fontFamily: "inherit", outline: "none",
        }}
      />
    </label>
  );
}
