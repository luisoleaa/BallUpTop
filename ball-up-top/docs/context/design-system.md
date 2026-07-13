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
- Team/competitor art has a fallback chain, implemented in `components/Crest.tsx`:
  custom logo SVG (`components/Logos.tsx`) → national flag SVG (`components/
  FlagBadge.tsx`) → colored monogram (abbreviation initials on a colored circle).
  Every side should always render *something* — don't add a "no logo" empty state.

## Ideas from the original mockup that did **not** ship — don't assume they exist

These were explored in the pre-build design mockup but are **not** in the current
codebase. Treat them as backlog ideas (see `docs/context/roadmap.md`), not existing
behavior to preserve or features someone forgot to remove:

- **OKLCH rating-color gradient** — mockup computed rating color dynamically as
  `oklch(0.74 0.17 ${28 + t*117})` (red→green interpolation by rating value). Current
  `globals.css` has no `oklch(` — ratings use the fixed `--star`/`--accent` vars
  instead. If asked to "make rating colors gradient by score," this is the reference
  formula to reintroduce.
- **`ratingMode` alt display** — mockup threaded a `ratingMode` prop through some
  mobile components suggesting a stars-vs-numeric toggle was explored. Never adopted;
  `RatingValue.tsx` just renders numeric `/10`.

## Partially shipped: `hideScores` (spoiler-free mode)

`components/MatchCard.tsx` **does** accept and honor a `hideScores?: boolean` prop
(when true, the score is hidden). This much shipped. What's *missing* is any caller
that actually passes `hideScores`, and any user-facing toggle/state to control it —
there's no `hideScores` in `lib/app-store.tsx` and no UI switch anywhere. So the
plumbing exists at the component level but the feature isn't wired up or reachable by
a user yet. If asked to finish "spoiler-free mode," this is the entry point — add
the toggle state (likely in `app-store.tsx`, persisted like other user prefs) and
thread it through the pages that render `MatchCard`.
