"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import { deleteAccountAction, updateDisplayNameAction, type ProfileActionState } from "@/lib/actions/profile";
import { BackLink } from "../ui/BackLink";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";

const initialState: ProfileActionState = {};

export function SettingsClient({ email, displayName }: { email: string; displayName: string }) {
  const { signOut, showToast, hideScores, toggleHideScores } = useApp();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateDisplayNameAction, initialState);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
    showToast("Signed out — browsing as guest");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccountAction();
    } catch (err) {
      setDeleting(false);
      showToast(err instanceof Error ? err.message : "Couldn't delete account.");
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "36px 28px 80px" }}>
      <BackLink />
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 26px", color: "var(--text)" }}>
        Settings
      </h1>

      <Card padding={22} style={{ marginBottom: 16 }}>
        <Label variant="section" style={{ marginBottom: 16 }}>Profile</Label>
        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Label>Display name</Label>
            <input
              name="displayName" defaultValue={displayName} maxLength={40} required
              className="bw-field"
              style={{
                height: 46, borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface-2)",
                padding: "0 14px", fontSize: 15, color: "var(--text)", fontFamily: "inherit",
              }}
            />
          </label>
          <div>
            <Label>Email</Label>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "6px 0 0" }}>{email}</p>
          </div>
          {state.error && <p style={{ color: "#ff6b6b", fontSize: 13.5, margin: 0 }}>{state.error}</p>}
          {state.saved && <p style={{ color: "var(--accent-strong)", fontSize: 13.5, margin: 0 }}>Saved.</p>}
          <Button type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>

      <Card padding={22} style={{ marginBottom: 16 }}>
        <Label variant="section" style={{ marginBottom: 16 }}>Preferences</Label>
        <button
          onClick={toggleHideScores}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
            border: "1px solid var(--border)", background: "var(--surface-2)", borderRadius: 12,
            padding: "12px 14px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <Icon name={hideScores ? "eyeOff" : "eye"} size={17} stroke={hideScores ? "var(--accent-strong)" : "var(--text-muted)"} />
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>Spoiler-free mode</span>
            <span style={{ display: "block", fontSize: 12.5, color: "var(--text-faint)", marginTop: 2 }}>
              Hide scores until you tap to reveal them
            </span>
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: hideScores ? "var(--accent-strong)" : "var(--text-faint)",
            fontFamily: "var(--font-mono, monospace)",
          }}>
            {hideScores ? "ON" : "OFF"}
          </span>
        </button>
      </Card>

      <Card padding={22} style={{ marginBottom: 16 }}>
        <Button variant="secondary" fullWidth onClick={handleSignOut}>Sign out</Button>
      </Card>

      <Card padding={22} tone="accent" style={{ borderColor: "#ff6b6b", background: "rgba(255,107,107,0.08)" }}>
        <Label variant="section" style={{ marginBottom: 12, color: "#ff6b6b" }}>Danger zone</Label>
        {!confirmingDelete ? (
          <Button
            variant="ghost" onClick={() => setConfirmingDelete(true)}
            icon={<Icon name="trash" size={16} stroke="#ff6b6b" />}
            style={{ color: "#ff6b6b" }}
          >
            Delete account
          </Button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              This permanently deletes your account, ratings, and reviews. This can&rsquo;t be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                style={{ background: "#ff6b6b", color: "#fff" }}
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
