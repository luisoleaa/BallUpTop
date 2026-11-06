"use client";

// /lists: the signed-in user's own lists, grid of Cards, create-list entry
// point. Auth is enforced by the parent Server Component.
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MatchList } from "@/lib/queries/lists";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";
import { CreateListModal } from "./CreateListModal";

export function ListsClient({ lists }: { lists: MatchList[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  return (
    <main
      style={{ maxWidth: 860, margin: "0 auto", padding: "44px 28px 80px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 26,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -1,
              margin: "0 0 6px",
              color: "var(--text)",
            }}
          >
            Your lists
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, margin: 0 }}>
            Collections of matches, fights, and races.
          </p>
        </div>
        <Button
          size="sm"
          pill
          onClick={() => setCreating(true)}
          icon={<Icon name="plus" size={16} stroke="var(--accent-text)" />}
        >
          New list
        </Button>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          image="/Wilt-100-ASCII.png"
          imageWidth={890}
          imageHeight={1116}
          alt="ASCII-art portrait of Wilt Chamberlain"
          title="No lists yet."
          subtitle="Start one from a match page, or create one here."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {lists.map((list) => (
            <Card
              key={list.id}
              href={`/lists/${list.id}`}
              hoverable
              padding="18px 16px"
            >
              {list.isWatchlist && (
                <Label
                  variant="sub"
                  color="var(--accent-strong)"
                  style={{ marginBottom: 6 }}
                >
                  Watchlist
                </Label>
              )}
              <div
                style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}
              >
                {list.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-mono, monospace)",
                  marginTop: 6,
                }}
              >
                {list.itemCount} {list.itemCount === 1 ? "match" : "matches"}
              </div>
            </Card>
          ))}
        </div>
      )}

      {creating && (
        <CreateListModal
          onClose={() => setCreating(false)}
          onCreated={(id) => router.push(`/lists/${id}`)}
        />
      )}
    </main>
  );
}
