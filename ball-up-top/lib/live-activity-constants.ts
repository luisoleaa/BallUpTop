// Shared between lib/actions/live-activity.ts (server, enforces this) and
// components/match/PulseTapRow.tsx (client, re-enables the tap row after
// this) so the two can never drift out of sync again.
export const PULSE_COOLDOWN_MS = 2000;

// The client waits slightly longer than the server's own cooldown so it
// never re-enables before the server would actually accept the next pulse.
export const PULSE_CLIENT_COOLDOWN_MS = PULSE_COOLDOWN_MS + 150;

// Same pattern as the pulse cooldown above, for chat (lib/actions/
// live-activity.ts's postLiveChatMessageAction, components/match/
// LiveActivityPanel.tsx's send handler). Longer than the pulse cooldown
// since chat is a longer-form action than a 1-tap rating, but still short
// enough not to feel laggy for a one-line message.
export const CHAT_COOLDOWN_MS = 4000;
export const CHAT_CLIENT_COOLDOWN_MS = CHAT_COOLDOWN_MS + 150;
