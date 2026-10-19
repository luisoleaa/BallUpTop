"use client";

// Simple list of users (followers or following) for a profile's
// /followers and /following pages. No pagination -- small scale for now.
import Link from "next/link";
import { useApp } from "@/lib/app-store";
import { Avatar } from "../ui/Avatar";
import { BackLink } from "../ui/BackLink";
import { EmptyState } from "../ui/EmptyState";
import { FollowButton } from "./FollowButton";

export interface FollowListEntry {
  id: string;
  displayName: string;
  isFollowing: boolean;
}

export function FollowListClient({
  title,
  entries,
}: {
  title: string;
  entries: FollowListEntry[];
}) {
  const { user } = useApp();

  return (
    <main
      style={{ maxWidth: 560, margin: "0 auto", padding: "36px 28px 80px" }}
    >
      <BackLink />
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: -1,
          margin: "18px 0 24px",
          color: "var(--text)",
        }}
      >
        {title}
      </h1>
      {entries.length === 0 ? (
        <EmptyState
          image="/Wilt-100-ASCII.png"
          imageWidth={890}
          imageHeight={1116}
          alt="ASCII-art portrait of Wilt Chamberlain"
          title="Nobody here yet."
        />
      ) : (
        entries.map((e) => (
          <div
            key={e.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <Link
              href={`/users/${e.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
                minWidth: 0,
                textDecoration: "none",
              }}
            >
              <Avatar name={e.displayName} seed={e.id} size={38} />
              <span
                style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}
              >
                {e.displayName}
              </span>
            </Link>
            {user && user.id !== e.id && (
              <FollowButton targetId={e.id} initialFollowing={e.isFollowing} />
            )}
          </div>
        ))
      )}
    </main>
  );
}
