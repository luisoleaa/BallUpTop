# Design system

## Theme: dark (chosen, final)

The original design mockup prototyped three directions — `dark` ("Sleek dark," lime
accent, Bricolage Grotesque), `warm` (terracotta on cream), `minimal` (near-black on
off-white, Schibsted Grotesk). **Dark won** and is what's shipped. Don't propose
switching the overall palette without being asked — it's a settled decision, not an
open question.

Confirmed live in `app/globals.css`:

```
--bg: #0b0c0f          --surface: #15171c       --surface-2: #1e2128
--text: #f4f5f7        --text-muted: #9aa0ab    --text-faint: #5c626d
--border: rgba(255,255,255,0.09)
--accent: #b6f24a (lime green)   --accent-text: #12150a
--star: #c8ff4d        --radius: 18px
```

Fonts (via `next/font/google`, wired in `app/layout.tsx`): **Bricolage Grotesque**
for display/body text, **JetBrains Mono** reserved specifically for numeric/data
content — scores, ratings, counts, timestamps, uppercase section-eyebrow labels. This
"data vs. prose" font split is a consistent rule across every screen; keep using it
for new UI rather than defaulting everything to the body font.

## Interaction & layout conventions

- Cards lift on hover, no glow/shadow effect: `.bw-card:hover { border-color:
  var(--text-faint); transform: translateY(-2px); }`
- One explicit responsive breakpoint: `.bw-detail-grid` (used on match/event detail
  pages) collapses from a two-column grid (`minmax(0,1fr) 360px`) to one column under
  `max-width: 900px`.
- Rating input: continuous slider (`.rm-slider`) *plus* quick-pick buttons for common
  values (6, 7, 7.5, 8, 8.5, 9, 10) — not just a bare slider. Scale is 0–10.0, one
  decimal place, not 5-star.
- Rate flow is a **centered modal dialog** on web (`RateModal.tsx`), not a bottom
  sheet — the original mockup used a mobile bottom sheet; the web port deliberately
  adapted this to a modal rather than porting it literally. Keep that adaptation in
  mind if referencing the original mockup for other mobile-first patterns.
- Team/competitor art has a fallback chain, implemented in `components/ui/Crest.tsx`:
  custom logo SVG (`components/ui/Logos.tsx`) → national flag SVG
  (`components/ui/FlagBadge.tsx`) → colored monogram (abbreviation initials on a
  colored circle). Every side should always render *something* — don't add a "no
  logo" empty state. This is only for the mock `Side` model — real-team logos on
  `/search` results use a different component, `components/search/TeamLogo.tsx`
  (hotlinked from ESPN's CDN, falling back to a colored monogram of its own).

## Shipped: OKLCH rating-color gradient

`components/ui/RatingValue.tsx`'s `ratingColor()` computes
`oklch(0.74 0.17 ${28 + t*117})`, a red→green interpolation by rating value — used
for the numeric rating display and the match-detail rating-slider fill. This was
explored in the original mockup and not shipped for a while; it's live now. Don't
reintroduce a fixed `--star`/`--accent` rating color as a "fix" — the gradient is
intentional.

Still not shipped: a `ratingMode` stars-vs-numeric toggle the original mockup
explored on some mobile components. `RatingValue.tsx` only renders numeric `/10`.

## Shipped: `hideScores` (spoiler-free mode)

Fully wired now (previously just a component-level prop with nothing calling it).
`lib/app-store.tsx` holds the persisted `hideScores` state; `Nav.tsx` has an eye-icon
toggle, `/settings` has a labeled one. Every `MatchCard` grid
(`HomeGrid`/`BrowseClient`) respects it, and `MatchDetailClient.tsx`'s scoreboard
masks the score behind a "Reveal score" button for finished matches — including
suppressing the winner-dimming visual hint, which would otherwise leak the result.
