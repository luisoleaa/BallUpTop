# Vision & naming

## What it is

**Ball Up Top** — "a Letterboxd for sports." Browse live and upcoming games across
soccer, NBA, NFL, tennis, MLB, F1, UFC, NHL, and cricket; rate the ones you watched on
a 0–10.0 scale, tag them, write a short review, and keep a personal diary of everything
you've logged.

Hero copy (used verbatim in the shipped app): **"Rate every match you watch."** /
"Keep a diary of the games that moved you. Score them, review them, see what fans
loved."

Target user: someone who watches games across several sports and wants a personal
ledger of what they watched and how good it was, plus a social layer of fan reviews —
not a scores/stats app, a *taste and memory* app.

## Naming history

The app was originally prototyped under the name **"Rematch."** That's why leftover
CSS class prefixes in `app/globals.css` are `rm-` (`rm-slider`, `rm-pulse`, `rm-toast`)
— these are intentional legacy, not a bug. `bw-` prefixes (`bw-card`, `bw-navlink`,
`bw-detail-grid`) stand for "Ball up top Web," from after the rename. Don't rename
these classes as "cleanup" — they're just old naming, functionally fine.

The app icon/logo has its own name: **"The Lob"** — a ball arcing up along a dotted
path, echoing "ball up top" (lobbing the ball up top).

## Match vs Event — this is deliberate, not redundant

- `Match` (`lib/types.ts`) is the atomic unit: one game, fight, or race — soccer match,
  NBA game, tennis match, F1 race, a single UFC fight.
- `Event` is specifically a **UFC fight card** that bundles multiple `Match` records
  under one card (see `Event.fights: string[]` in `lib/types.ts`, and `m.event` on a
  `Match` pointing back to its parent card). `app/events/[id]` renders the card;
  `app/matches/[id]` renders an individual fight/game.
- The word "game" was deliberately dropped from routing/terminology in favor of
  "match" to stay sport-agnostic — it reads fine for tennis, soccer, and even UFC
  fights (stored as `Match` records).

## Tone & vocabulary

Terse, confident, sports-fan vernacular — not corporate. Fixed tag vocabulary for
describing a match (see `lib/data.ts`): **Instant classic, Comeback, Blowout,
Heartbreak, Snoozer, Upset, Overtime.** Diary entries are "logs" (Letterboxd's "log a
film" → "log a match") — toast copy says "Logged to your diary," diary stats say
"3 logged."

## Guest vs signed-in philosophy

Browsing and reading fan reviews/ratings is public and free — no account needed.
Logging your own rating/review requires signing in. This split is intentional and
shows up as: `/diary` redirects guests to `/login?reason=diary`; attempting to rate a
match as a guest redirects to `/login?reason=rate` and resumes the rate flow right
after sign-in. Guest messaging: *"Browse ratings freely — sign in when you're ready to
log your own."*

Auth is currently **entirely mock/local** (see `docs/context/architecture.md`) — any
email/password combination "works." This is expected, not a bug to fix reflexively.
