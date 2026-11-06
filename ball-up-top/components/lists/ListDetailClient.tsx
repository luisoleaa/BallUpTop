"use client";

// A single list's detail page: title/description, item rows, owner-only
// edit/delete/remove-item controls (also enforced for real by RLS).
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteListAction, removeFromListAction } from "@/lib/actions/lists";
import type { MatchList } from "@/lib/queries/lists";
import type { Match } from "@/lib/types";
import { useApp } from "@/lib/app-store";
import { BackLink } from "../ui/BackLink";
import { Button } from "../ui/Button";
import { Crest } from "../ui/Crest";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";
import { SportChip } from "../ui/SportChip";

export function ListDetailClient({
  list,
  items,
  isOwner,
}: {
  list: MatchList;
  items: { match: Match; addedAt: string }[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const { showToast } = useApp();
  const [deleting, setDeleting] = useState(false);

  const handleRemove = async (matchId: string) => {
    const result = await removeFromListAction(list.id, matchId);
    if ("error" in result) showToast(result.error);
    else router.refresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteListAction(list.id);
    if ("error" in result) {
      showToast(result.error);
      setDeleting(false);
      return;
    }
    router.push("/lists");
  };

  return (
    <main
      style={{ maxWidth: 760, margin: "0 auto", padding: "36px 28px 80px" }}
    >
      <BackLink href="/lists" />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 6,
        }}
      >
        <div>
          {list.isWatchlist && (
            <Label
              variant="sub"
              color="var(--accent-strong)"
              style={{ marginBottom: 6 }}
            >
              Watchlist
            </Label>
          )}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -1,
              margin: 0,
              color: "var(--text)",
            }}
          >
            {list.title}
          </h1>
          {list.description && (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 15,
                margin: "8px 0 0",
                lineHeight: 1.5,
              }}
            >
              {list.description}
            </p>
          )}
        </div>
        {isOwner && !list.isWatchlist && (
          <Button
            variant="ghost"
            size="sm"
            disabled={deleting}
            onClick={handleDelete}
            icon={<Icon name="trash" size={15} stroke="var(--accent-strong)" />}
          >
            Delete list
          </Button>
        )}
      </div>

      <div style={{ marginTop: 26 }}>
        {items.length === 0 ? (
          <EmptyState
            image="/Wilt-100-ASCII.png"
            imageWidth={890}
            imageHeight={1116}
            alt="ASCII-art portrait of Wilt Chamberlain"
            title="No matches in this list yet."
          />
        ) : (
          items.map(({ match: m }) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                borderBottom: "1px solid var(--border)",
                padding: "16px 0",
              }}
            >
              <Link
                href={`/matches/${m.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flex: 1,
                  minWidth: 0,
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Crest side={m.a} size={34} />
                  <Crest side={m.b} size={34} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--text)",
                      }}
                    >
                      {m.a.abbr} v {m.b.abbr}
                    </span>
                    <SportChip sport={m.sport} muted />
                  </div>
                </div>
              </Link>
              {isOwner && (
                <button
                  onClick={() => handleRemove(m.id)}
                  aria-label="Remove from list"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 6,
                    flexShrink: 0,
                  }}
                >
                  <Icon name="trash" size={16} stroke="var(--text-faint)" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
