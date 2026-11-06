"use client";

// Live chat + rating-pulse panel for a match page. Delivery is polling, not
// Supabase Realtime -- reuses components/live/liveGamesClient.tsx's exact
// convention (setInterval + fetch, paused on document.hidden, resumed on
// visibilitychange) rather than introducing a new real-time pattern.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import {
  postLiveChatMessageAction,
  submitRatingPulseAction,
} from "@/lib/actions/live-activity";
import { CHAT_CLIENT_COOLDOWN_MS } from "@/lib/live-activity-constants";
import { timeAgo } from "@/lib/time-ago";
import type {
  LiveChatMessage,
  LiveRatingPulse,
  MatchStatus,
} from "@/lib/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";
import { LiveRatingChart } from "./LiveRatingChart";
import { PulseTapRow } from "./PulseTapRow";

const POLL_MS = 5000;

interface Props {
  matchId: string;
  initialStatus: Exclude<MatchStatus, "upcoming">; // caller hides the panel entirely for "upcoming"
  // The parent's own view of match status (from its separate 30s scoreboard
  // poll). Lets this panel catch up immediately if that poll reports "final"
  // before this panel's own 5s poll does, instead of showing a live
  // pulse/chat UI under an already-final scoreboard for up to one tick.
  matchStatus: MatchStatus;
  initialMessages: LiveChatMessage[];
  initialPulses: LiveRatingPulse[];
}

function byId<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function latestCreatedAt(items: { createdAt: string }[]): string | undefined {
  return items.reduce<string | undefined>(
    (max, item) => (!max || item.createdAt > max ? item.createdAt : max),
    undefined,
  );
}

// Shared by handlePulse/handlePostMessage below: both insert a temp entry,
// await the server action, then either replace the temp entry with the real
// row or roll it back and toast the error. Auth-gating, cooldown-setting, and
// draft-clearing differ per call site and stay there -- this only covers the
// part that's identical.
async function submitOptimistic<
  TEntry extends { id: string },
  TResult extends object,
>(
  setById: React.Dispatch<React.SetStateAction<Record<string, TEntry>>>,
  tempEntry: TEntry,
  action: () => Promise<{ error: string } | TResult>,
  extractEntry: (result: TResult) => TEntry,
  showToast: (msg: string) => void,
): Promise<TEntry | null> {
  setById((prev) => ({ ...prev, [tempEntry.id]: tempEntry }));
  let result: { error: string } | TResult;
  try {
    result = await action();
  } catch {
    setById((prev) => {
      const next = { ...prev };
      delete next[tempEntry.id];
      return next;
    });
    showToast("Something went wrong — try again.");
    return null;
  }
  let committed: TEntry | null = null;
  setById((prev) => {
    const next = { ...prev };
    delete next[tempEntry.id];
    if (!("error" in result)) {
      committed = extractEntry(result);
      next[committed.id] = committed;
    }
    return next;
  });
  if ("error" in result) showToast(result.error);
  return committed;
}

// Temp ids only need to be unique within this client session's in-memory
// state, not cryptographically random -- crypto.randomUUID() requires a
// secure context (HTTPS/localhost) and is undefined otherwise.
let tempIdCounter = 0;
function makeTempId(): string {
  tempIdCounter += 1;
  return `temp-${Date.now()}-${tempIdCounter}`;
}

export function LiveActivityPanel({
  matchId,
  initialStatus,
  matchStatus,
  initialMessages,
  initialPulses,
}: Props) {
  const { user, showToast } = useApp();
  const router = useRouter();
  const [status, setStatus] = useState<MatchStatus>(initialStatus);
  // One-way ratchet toward "final" only: if the parent's own poll reports
  // final before this panel's next 5s tick does, adopt it early rather than
  // waiting. Never moves status the other way -- this panel's own poll
  // (resolveMatchStatus, server-verified) stays authoritative for that.
  const [prevMatchStatus, setPrevMatchStatus] = useState(matchStatus);
  if (matchStatus !== prevMatchStatus) {
    setPrevMatchStatus(matchStatus);
    if (matchStatus === "final" && status !== "final") setStatus("final");
  }
  const [messagesById, setMessagesById] = useState<
    Record<string, LiveChatMessage>
  >(() => byId(initialMessages));
  const [pulsesById, setPulsesById] = useState<Record<string, LiveRatingPulse>>(
    () => byId(initialPulses),
  );
  const [draft, setDraft] = useState("");
  const [chatCooldown, setChatCooldown] = useState(false);
  const isLive = status === "live";

  // Tracks the newest pulse/message createdAt we've already fetched, so each
  // poll can ask the server for only rows newer than that (see
  // getLiveRatingPulses'/getLiveChatMessages' `since` params) instead of
  // re-fetching the whole match's history every 5s. Seeded from the initial
  // SSR load.
  const latestPulseAtRef = useRef<string | undefined>(
    latestCreatedAt(initialPulses),
  );
  const latestMessageAtRef = useRef<string | undefined>(
    latestCreatedAt(initialMessages),
  );

  // Union-merge on every poll rather than a wholesale replace: unlike live
  // scores (which mutate in place by a stable id), chat/pulses only ever
  // grow, so a merge can't flicker a just-submitted row in and out.
  useEffect(() => {
    if (!isLive) return;
    let cancelled = false;

    const poll = async () => {
      if (document.hidden || cancelled) return;
      try {
        const since = latestPulseAtRef.current;
        const messagesSince = latestMessageAtRef.current;
        const qs = new URLSearchParams();
        if (since) qs.set("since", since);
        if (messagesSince) qs.set("messagesSince", messagesSince);
        const query = qs.toString();
        const res = await fetch(
          `/api/matches/${matchId}/live-activity${query ? `?${query}` : ""}`,
        );
        // The effect's cleanup (e.g. isLive flipping false) can run while
        // this fetch/json parse is in flight -- re-check `cancelled` after
        // every await, not just the fetch, so a stale response can't still
        // mutate state (or this closure's matchId-scoped refs) afterward.
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        const newMessages: LiveChatMessage[] = data.messages ?? [];
        if (newMessages.length) {
          setMessagesById((prev) => ({ ...prev, ...byId(newMessages) }));
          const newest = latestCreatedAt(newMessages);
          if (
            newest &&
            (!latestMessageAtRef.current || newest > latestMessageAtRef.current)
          ) {
            latestMessageAtRef.current = newest;
          }
        }
        const newPulses: LiveRatingPulse[] = data.pulses ?? [];
        if (newPulses.length) {
          setPulsesById((prev) => ({ ...prev, ...byId(newPulses) }));
          const newest = latestCreatedAt(newPulses);
          if (
            newest &&
            (!latestPulseAtRef.current || newest > latestPulseAtRef.current)
          ) {
            latestPulseAtRef.current = newest;
          }
        }
        if (data.status && data.status !== "live") setStatus(data.status);
      } catch {
        // Network error -- keep stale data, try again next tick.
      }
    };

    poll();
    const intervalId = setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [matchId, isLive]);

  const messages = useMemo(
    () =>
      Object.values(messagesById).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      ),
    [messagesById],
  );
  const pulses = useMemo(
    () =>
      Object.values(pulsesById).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      ),
    [pulsesById],
  );

  const requireAuth = () => {
    if (!user) {
      router.push(
        `/login?reason=live&from=${encodeURIComponent(`/matches/${matchId}`)}`,
      );
      return false;
    }
    return true;
  };

  const handlePulse = async (rating: number) => {
    if (!requireAuth()) return;
    const tempEntry: LiveRatingPulse = {
      id: makeTempId(),
      matchId,
      rating,
      createdAt: new Date().toISOString(),
    };
    const committed = await submitOptimistic(
      setPulsesById,
      tempEntry,
      () => submitRatingPulseAction(matchId, rating),
      (r) => r.pulse,
      showToast,
    );
    // Bumps the since-cursor immediately so the next poll (which could land
    // before the server-action response is even fully settled elsewhere)
    // doesn't re-fetch the pulse we already just received here.
    if (
      committed &&
      (!latestPulseAtRef.current ||
        committed.createdAt > latestPulseAtRef.current)
    ) {
      latestPulseAtRef.current = committed.createdAt;
    }
  };

  const handlePostMessage = async () => {
    if (!requireAuth() || chatCooldown) return;
    const text = draft.trim();
    if (!text) return;
    setChatCooldown(true);
    setTimeout(() => setChatCooldown(false), CHAT_CLIENT_COOLDOWN_MS);
    setDraft("");
    const tempEntry: LiveChatMessage = {
      id: makeTempId(),
      matchId,
      // Fixed label, not user?.name: the real response uses
      // profiles.display_name, which can differ from the auth-derived
      // name -- showing "You" avoids the poster's own message visibly
      // renaming itself when the real row lands a moment later.
      userName: "You",
      message: text,
      createdAt: new Date().toISOString(),
    };
    const committed = await submitOptimistic(
      setMessagesById,
      tempEntry,
      () => postLiveChatMessageAction(matchId, text),
      (r) => r.message,
      showToast,
    );
    // Same reasoning as handlePulse's bump above.
    if (
      committed &&
      (!latestMessageAtRef.current ||
        committed.createdAt > latestMessageAtRef.current)
    ) {
      latestMessageAtRef.current = committed.createdAt;
    }
  };

  return (
    <>
      <Card padding={22}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Label variant="sub">Fan pulse — live ratings</Label>
          {isLive && (
            <span
              className="rm-pulse"
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: "var(--live)",
              }}
            />
          )}
        </div>
        <LiveRatingChart pulses={pulses} />
        {isLive ? (
          user ? (
            <PulseTapRow onTap={handlePulse} />
          ) : (
            <button onClick={requireAuth} style={signInLinkStyle}>
              Sign in to pulse-rate this match live
            </button>
          )
        ) : (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-faint)",
              margin: "10px 0 0",
            }}
          >
            {pulses.length > 0
              ? "Final — how fans felt, live."
              : "No one pulse-rated this match live."}
          </p>
        )}
      </Card>

      <Card padding={22}>
        <Label variant="sub" style={{ marginBottom: 14 }}>
          Live chat
        </Label>
        <div
          style={{
            maxHeight: 260,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-faint)" }}>
              No messages yet.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 12.5,
                  color: "var(--text)",
                }}
              >
                {m.userName}
              </span>{" "}
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {timeAgo(m.createdAt)}
              </span>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 14,
                  color: "var(--text)",
                }}
              >
                {m.message}
              </p>
            </div>
          ))}
        </div>
        {isLive &&
          (user ? (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePostMessage();
                }}
                maxLength={240}
                placeholder="Say something…"
                className="bw-field"
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  padding: "0 12px",
                  color: "var(--text)",
                  fontFamily: "inherit",
                }}
              />
              <Button
                size="sm"
                disabled={!draft.trim() || chatCooldown}
                onClick={handlePostMessage}
                icon={
                  <Icon name="chat" size={14} stroke="var(--accent-text)" />
                }
              >
                Send
              </Button>
            </div>
          ) : (
            <button
              onClick={requireAuth}
              style={{ ...signInLinkStyle, marginTop: 12 }}
            >
              Sign in to chat
            </button>
          ))}
      </Card>
    </>
  );
}

const signInLinkStyle = {
  marginTop: 10,
  background: "none",
  border: "none",
  color: "var(--accent-strong)",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
} as const;
