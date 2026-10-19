"use client";

// Small modal for creating a new list -- overlay/panel markup mirrors
// RateModal's, with a title + description form instead of a rating form.
import { useEffect, useState } from "react";
import { createListAction } from "@/lib/actions/lists";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";

export function CreateListModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (listId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  const close = () => {
    setShow(false);
    setTimeout(onClose, 220);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const result = await createListAction(title, description);
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onCreated(result.id);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          opacity: show ? 1 : 0,
          transition: "opacity .2s",
        }}
      />
      <div
        style={{
          position: "relative",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 22,
          padding: "26px 28px 28px",
          width: "100%",
          maxWidth: 420,
          transform: show
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.98)",
          opacity: show ? 1 : 0,
          transition: "all .22s cubic-bezier(.32,.72,0,1)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <Label as="h2" variant="section">
            New list
          </Label>
          <button
            onClick={close}
            aria-label="Close"
            style={{
              marginLeft: "auto",
              border: "none",
              background: "var(--surface-2)",
              width: 34,
              height: 34,
              borderRadius: 99,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="close" size={18} stroke="var(--text-muted)" />
          </button>
        </div>

        <Label style={{ marginBottom: 8 }}>Title</Label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Best comebacks of 2026"
          className="bw-field"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            borderRadius: 14,
            padding: "12px 14px",
            fontSize: 15,
            color: "var(--text)",
            fontFamily: "inherit",
            marginBottom: 16,
          }}
        />

        <Label style={{ marginBottom: 8 }}>Description (optional)</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="bw-field"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            borderRadius: 14,
            padding: 14,
            fontSize: 15,
            color: "var(--text)",
            fontFamily: "inherit",
            resize: "none",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        />

        {error && (
          <p style={{ color: "#ff6b6b", fontSize: 13.5, margin: "0 0 16px" }}>
            {error}
          </p>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!title.trim() || saving}
          onClick={save}
        >
          {saving ? "Creating…" : "Create list"}
        </Button>
      </div>
    </div>
  );
}
