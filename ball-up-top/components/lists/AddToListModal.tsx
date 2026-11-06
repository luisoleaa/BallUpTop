"use client";

// Picker opened from a match page: toggle the match in/out of any of the
// viewer's lists, or create a new one inline. Overlay/panel markup mirrors
// RateModal's.
import { useEffect, useState } from "react";
import { addToListAction, removeFromListAction } from "@/lib/actions/lists";
import type { MatchList } from "@/lib/queries/lists";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";
import { CreateListModal } from "./CreateListModal";

export function AddToListModal({
  matchId,
  lists,
  initialContainingListIds,
  onClose,
}: {
  matchId: string;
  lists: MatchList[];
  initialContainingListIds: string[];
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);
  const [containing, setContaining] = useState(
    new Set(initialContainingListIds),
  );
  const [pending, setPending] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [localLists, setLocalLists] = useState(lists);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  const close = () => {
    setShow(false);
    setTimeout(onClose, 220);
  };

  const toggle = async (listId: string) => {
    setPending(listId);
    const inList = containing.has(listId);
    const result = inList
      ? await removeFromListAction(listId, matchId)
      : await addToListAction(listId, matchId);
    if (!("error" in result)) {
      setContaining((prev) => {
        const next = new Set(prev);
        if (inList) next.delete(listId);
        else next.add(listId);
        return next;
      });
    }
    setPending(null);
  };

  return (
    <>
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
            maxHeight: "70vh",
            overflowY: "auto",
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
              marginBottom: 16,
            }}
          >
            <Label as="h2" variant="section">
              Add to list
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

          {localLists.map((list) => (
            <button
              key={list.id}
              onClick={() => toggle(list.id)}
              disabled={pending === list.id}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 14px",
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                cursor: "pointer",
                marginBottom: 8,
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: `2px solid ${containing.has(list.id) ? "var(--accent)" : "var(--text-faint)"}`,
                  background: containing.has(list.id)
                    ? "var(--accent)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {containing.has(list.id) && (
                  <Icon
                    name="check"
                    size={13}
                    stroke="var(--accent-text)"
                    sw={3}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "var(--text)",
                  textAlign: "left",
                }}
              >
                {list.title}
              </span>
            </button>
          ))}

          <button
            onClick={() => setCreating(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 14px",
              borderRadius: 14,
              border: "1px dashed var(--border)",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "var(--accent-strong)",
            }}
          >
            <Icon name="plus" size={16} stroke="var(--accent-strong)" />
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>New list</span>
          </button>
        </div>
      </div>

      {creating && (
        <CreateListModal
          onClose={() => setCreating(false)}
          onCreated={async (id, title) => {
            setCreating(false);
            const result = await addToListAction(id, matchId);
            if (!("error" in result)) {
              setContaining((prev) => new Set(prev).add(id));
              setLocalLists((prev) => [
                {
                  id,
                  userId: "",
                  title,
                  description: null,
                  isWatchlist: false,
                  createdAt: new Date().toISOString(),
                  itemCount: 1,
                },
                ...prev,
              ]);
            }
          }}
        />
      )}
    </>
  );
}
