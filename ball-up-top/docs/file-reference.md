# Ball Up Top — Repository File Reference

> A plain-language map of **what every file in the repo does and how**. Written
> 2026-09-06. Meant to be dropped into the Obsidian vault next to
> `Ball-up-top-context.md`.
>
> Scope: the repository root is `sportLetterbox/`. It holds **three** app
> folders plus some agent-tooling config. Only `ball-up-top/` is live work; the
> other two are abandoned early scaffolds. Depth below matches that.

---

## 0. Top level — `sportLetterbox/`

| Path | What it is / how it works |
|------|---------------------------|
| `ball-up-top/` | **The real project.** Next.js 16 + React 19 + TypeScript + Supabase. "A Letterboxd for sports." Everything interesting is here. |
| `sports-letter/` | Abandoned Create-React-App prototype (the original name). Untouched CRA boilerplate + a stale `build/`. Superseded by `ball-up-top`. |
| `sports-letter/my-app/` | A *second*, even emptier CRA scaffold nested inside the first. Pure `create-react-app` output, never edited. |
| `.claude/`, `.agents/`, `.codex/`, `.impeccable/` | Config + skill bundles for AI coding agents (the "Impeccable" design-polish skill, hook scripts). Not application code; safe to ignore when reasoning about the app. |
| `.claude/settings.local.json` | Machine-local Claude Code permission allow-list. Not shared config. |
| `.codex/hooks.json` | Registers the Impeccable design hook to run after `Edit`/`Write` and on `Stop`. |
| `.impeccable/config.local.json` | Just records that the Impeccable skill's consent prompt was accepted. |

---

## 1. `ball-up-top/` — project root files

| Path | What it does / how |
|------|--------------------|
| `package.json` | Deps + scripts. `dev`/`build`/`start` = Next.js; `lint` = eslint; `test` = `vitest run`. Runtime deps: `next`, `react`, `@supabase/ssr` + `@supabase/supabase-js` (auth/db), `@balldontlie/sdk` + `dotenv` (used **only** by `scripts/`). |
| `package-lock.json` | npm lockfile. |
| `next.config.ts` | Sets baseline security response headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`) for every route, and forces `sw.js` to be served uncached as JS. **Deliberately no CSP** — the app styles with inline `style={{}}` everywhere, so a strict CSP would need `style-src 'unsafe-inline'` and is too risky to tune blind. |
| `proxy.ts` | Next 16's renamed `middleware.ts`. Runs on (almost) every request and calls `updateSession()` to refresh the Supabase auth cookie. The `matcher` skips static assets, icons, and `sw.js`. |
| `tsconfig.json` | Standard Next TS config. Path alias `@/*` → project root. |
| `eslint.config.mjs` | Flat ESLint config extending `eslint-config-next` (core-web-vitals + TS). Ignores `.next`, `build`, etc. |
| `postcss.config.mjs` | Loads `@tailwindcss/postcss` — Tailwind v4's PostCSS plugin. |
| `vitest.config.ts` | Vitest setup: Node environment, `@` alias mirrored so tests can import app modules. Only pure-logic files have tests. |
| `next-env.d.ts` | Auto-generated Next type shim. Never edit. |
| `tsconfig.tsbuildinfo` | Incremental-build cache. Generated. |
| `.gitignore` | Ignores `node_modules`, `.next`, `build`, `.env*.local`, `*.tsbuildinfo`, `.claude/settings.local.json`, and `scripts/.backfill-*.json` checkpoints. |
| `.env.example` | Template for `.env.local`: Supabase URL/anon key (client), `SUPABASE_SERVICE_ROLE_KEY` (scripts only), `BALL_DONT_LIE_API_KEY` + `BASE_URL` (scripts only), `NEXT_PUBLIC_SITE_URL` (metadata/OG/robots/sitemap). |
| `.env.local` | Real secrets. Git-ignored. Contains the live Supabase project keys + balldontlie key. |
| `README.md` | Human-facing intro: stack, "the two data systems coexist on purpose" explanation, getting-started commands, the one-time SQL-migration caveat, project-structure bullets. |
| `CLAUDE.md` | Loaded automatically by Claude Code. Just a list of `@`-imports pulling in `AGENTS.md`, the four `docs/context/*.md` files, and the external Obsidian context doc. |
| `AGENTS.md` | Auto-written by `next dev`. Warns that this Next.js version has breaking changes vs. training data and to read `node_modules/next/dist/docs/` before writing code. |

### `ball-up-top/docs/context/` — the "why" docs (auto-loaded via `CLAUDE.md`)

| Path | What it captures |
|------|------------------|
| `vision.md` | What the app is, the hero copy, naming history (**`rm-` CSS prefixes** = old "Rematch" name, **`bw-` prefixes** = "Ball up top Web" — both intentional, don't "clean up"). The **`Match` vs `Event`** distinction (Event = a UFC fight card bundling several Match records). Tone/vocabulary, fixed tag list, guest-vs-signed-in philosophy, spoiler-free mode rationale. |
| `design-system.md` | The dark theme is **final** (palette tokens listed). Font split rule: **Bricolage Grotesque** for prose, **JetBrains Mono** for all numbers/data/eyebrow labels. Card hover = lift, no glow. One responsive breakpoint (`.bw-detail-grid` at 900px). Rating input = slider + quick-picks, 0–10.0 not 5-star. Rate flow is a centered **modal** on web. Crest fallback chain. The OKLCH rating-color gradient is shipped and intentional. |
| `architecture.md` | The definitive technical overview: stack, the **two data systems** (mock `Match`/`Event` in `lib/data.ts` vs. real `nba/nfl/mlb_games` archive), every real-backend piece by area, the server/`*Client.tsx` split pattern to follow for new routes, component conventions, PWA/hardening notes, the `next/font/google` blank-page gotcha, deleted-legacy-files list, and **"schema not tracked in this repo"** (now partly addressed by `supabase/migrations/`). |
| `roadmap.md` | What's done vs. open. Open threads: the pending SQL migration (now run — see `supabase/migrations/`), unifying mock + real game systems, mobile app stores. |

### `ball-up-top/supabase/migrations/` — schema (new 2026-09-06)

| Path | What it does |
|------|--------------|
| `README.md` | Explains this folder only tracks changes from 2026-09-06 on; lists what pre-existed and isn't reproduced. |
| `20260906000001_add_postseason_and_rewrite_game_search.sql` | Adds nullable `postseason boolean` to `nba/nfl/mlb_games`; rewrites the `game_search` view to also expose `postseason`, `home_team_abbr`, `visitor_team_abbr` (LEFT JOIN to the `*_teams` tables); sets `security_invoker = on` on the view. |
| `20260906000002_create_review_likes.sql` | `review_likes(user_id, rating_id, created_at)` join table + RLS (public read, own-row insert/delete). Backs real likes on fan reviews. |
| `20260906000003_create_reports.sql` | `reports(id, reporter_id, rating_id, created_at)` + RLS (own-row insert/read only, **not** public). Backs "report this review." |
| `20260906000004_create_delete_own_account_rpc.sql` | `delete_own_account()` — `security definer` function that deletes the caller's own `auth.users` row; cascades to `profiles`/`ratings`/`review_likes`/`reports`. |
| `20260906000005_add_profiles_insert_policy.sql` | Adds the missing own-row `INSERT` policy on `profiles` so `updateDisplayNameAction`'s upsert works for users with no profile row. |

---

## 2. `ball-up-top/app/` — routes & framework files (App Router)

Every data-fetching route follows the same shape: a thin **server** `page.tsx`
(fetch + `notFound()`/`redirect()`) paired with a **client** `*Client.tsx` under
`components/<area>/` for interactivity. Dynamic params are typed
`Promise<{...}>` and `await`ed.

### App shell / framework conventions

| Path | What it does / how |
|------|--------------------|
| `layout.tsx` | Root layout. Loads the two Google fonts via `next/font/google` (⚠ don't add `axes` alongside fixed `weight` — silent blank-page bug). Sets all site metadata (title template, OpenGraph, Twitter, Apple-web-app tags), theme color. Server-fetches the current user with `getUser()` and passes it to `AppProvider` so there's no signed-out flash. Renders `RegisterSW`, `Nav`, `Toast`, the page, `Footer`. |
| `globals.css` | The only real stylesheet. `@import "tailwindcss"` + all CSS custom properties (colors, spacing scale, radii). Global reset. Defines `.rm-slider` (rating slider), `.rm-pulse`/`.rm-toast` keyframes, `.bw-card` hover lift, `.bw-field`/`.bw-search` focus rings, the per-variant `.bw-btn--*` hover treatments (primary = accent glow + dashed arc, secondary = fill-from-bottom, ghost = growing underline), the 900px `.bw-detail-grid` collapse, and `prefers-reduced-motion` overrides. |
| `page.tsx` | **Home.** Server component. Filters mock `MATCHES` into Live / Popular-this-week / Upcoming / Fight-cards sections; `getTopReviews(4)` for "Popular reviews"; `await getOnThisDay(6)` for "On this day in sports history" (real archive). Local `Section` helper for the heading + optional right-side action. |
| `error.tsx` | Client error boundary. Branded "Something went wrong" with "Try again" (`reset()`) / "Back to home". |
| `not-found.tsx` | Branded 404 using the MJ ASCII art in an `EmptyState`. |
| `manifest.ts` | PWA web manifest (name, `display: "standalone"`, colors, the three icon entries: `/icon`, `/apple-icon`, `/maskable-icon`). |
| `robots.ts` | `robots.txt` generator — allows all except `/settings` and `/api/`, points at the sitemap. Uses `NEXT_PUBLIC_SITE_URL`. |
| `sitemap.ts` | `sitemap.xml` generator — static routes + every mock match/event URL. Deliberately omits the hundreds of thousands of real per-game pages. |
| `icon.tsx` | 512×512 PNG app icon rendered on the fly via `next/og` `ImageResponse` — `LogoStatic` (the "Lob" mark) centered on the dark background. |
| `apple-icon.tsx` | Same, 180×180, for iOS home-screen. |
| `maskable-icon/route.tsx` | Plain Route Handler (not an icon-convention file, since those can't have a "maskable" variant) returning a 512×512 PNG with the mark sized to sit inside Android's ~80% safe zone. Referenced from `manifest.ts`. |
| `opengraph-image.tsx` | 1200×630 social-share PNG via `ImageResponse`: logo + "Ball Up Top" + tagline. |

### Content routes

| Path | What it does / how |
|------|--------------------|
| `browse/page.tsx` | Thin wrapper → `BrowseClient`. Sets tab title. |
| `diary/page.tsx` | Server: `getUser()`, redirect guests to `/login?reason=diary`, then `getUserRatings(user.id)` → `DiaryClient`. |
| `diary/loading.tsx` | Skeleton placeholder shown while the diary query runs. |
| `matches/[id]/page.tsx` | Server: `getMatch(id)` from mock data (or `notFound()`); builds the **synthetic** rating-distribution curve from `match.avg`; fetches the user's own rating + the real fan reviews (`getMatchReviews`) → `MatchDetailClient`. `generateMetadata` deliberately omits the score from the description (link previews are "more public" than the app). |
| `matches/[id]/loading.tsx` | Two-column detail-page skeleton. |
| `events/[id]/page.tsx` | Server: `getEvent(id)` (UFC fight card) or `notFound()`; resolves its `fights[]` ids to mock `Match` objects and renders them in a `HomeGrid`. Has its own header (status pill + venue). |
| `login/page.tsx` | Thin wrapper → `LoginClient`. |
| `settings/page.tsx` | Server: `getUser()` (redirect guests), `getDisplayName()` → `SettingsClient`. |
| `settings/loading.tsx` | Settings skeleton. |
| `search/page.tsx` | Server: reads `?q/&sport/&sort` search params, runs the **first** `searchGames()` query server-side (real SSR, no first-load flash) → `SearchClient`. |
| `search/loading.tsx` | Search skeleton. |
| `games/[sport]/[id]/page.tsx` | Minimal detail page for one **real** historical game found via `/search`. Validates `sport` ∈ nba/nfl/mlb and numeric `id`, `getGame()` or `notFound()`. Mounts `GameViewTracker` to bump the view count. |
| `games/[sport]/[id]/loading.tsx` | Skeleton for the above. |
| `privacy/page.tsx` | Static Privacy Policy. Honestly describes what the app collects; flagged inline as **not lawyer-reviewed**; has a `[add a real contact email before launch]` placeholder. |
| `terms/page.tsx` | Static Terms of Service. Same draft/placeholder caveats. |

### API

| Path | What it does / how |
|------|--------------------|
| `api/games/search/route.ts` | `GET /api/games/search?q=&sport=&sort=&page=`. Thin wrapper — validates params, delegates all logic to `searchGames()` in `lib/queries/games.ts`, returns JSON. Used by `SearchClient` for debounced re-search after the SSR first load. |

---

## 3. `ball-up-top/lib/` — data, state, server logic

### Core data model & mock data

| Path | What it does / how |
|------|--------------------|
| `types.ts` | All shared types. `SportSlug` (9 sports), `MatchStatus`, `Side` (`score` is `number | string | null` — string is for F1 positions / UFC results, not a bug), `Match` (the atomic game/fight/race), `Event` (UFC card), `SeedReview` (mock filler), `UserLog` (what `RateModal` collects), `User` (real `auth.users.id` + name), `Rating` (DB-backed `public.ratings` row shape). |
| `data.ts` | The mock `Match`/`Event` system. `SPORTS` (name+color per sport), `MATCHES[]` (all mock games), `EVENTS[]` (UFC cards referencing fight ids), `REVIEWS` (seed fan reviews keyed by match id), `SEED_LOGS` (sample diary entries, currently unused), `TAGS` (fixed tag vocabulary). Helpers: `getMatch`, `getEvent`, `getTopReviews(limit)` (flattens+sorts all seed reviews by `likes` for the home "Popular reviews" strip). Pages read through these helpers so a real provider can swap in later. |

### Client state

| Path | What it does / how |
|------|--------------------|
| `app-store.tsx` | `AppProvider` + `useApp()` React context — the client-side glue. Holds: `user` (seeded from the server, kept in sync via `supabase.auth.onAuthStateChange`), `ratingsByMatch` (the current user's own ratings, fetched live from Supabase — **not** persisted locally), `hideScores` (spoiler-free mode — the **one** thing persisted to `localStorage`, key `ballup_hide_scores_v1`), and `toast` (auto-clears after 2.2s). Exposes `signOut`, `refreshRatings`, `showToast`, `toggleHideScores`. |
| `to-user.ts` | `toUser()` — maps a Supabase auth user to the app's `User` shape. Shared by the server layout and the client store so both derive the display name identically (metadata `name` → email local-part → `"jordan"`). Has unit tests. |
| `ratings-row.ts` | `toRating()` — maps a raw snake_case `ratings` table row to the camelCase `Rating` type; coerces the numeric-string rating to a number, defaults null tags to `[]`. Has unit tests. |
| `time-ago.ts` | `timeAgo(iso)` — compact relative-time label ("now", "5m", "3h", "4d", "2mo", "1y") matching the terse review style. Has unit tests. |

### Supabase clients

| Path | What it does / how |
|------|--------------------|
| `supabase/client.ts` | `createClient()` — browser Supabase client (`createBrowserClient`, anon key). |
| `supabase/server.ts` | `createClient()` — server client (`createServerClient` wired to Next `cookies()`), plus `getUser()` helper. Use `getUser()` (not `getSession()`) anywhere the result gates access. |
| `supabase/middleware.ts` | `updateSession(request)` — the token-refresh dance for `proxy.ts`: builds a request-scoped server client, calls `supabase.auth.getUser()` (that call is what refreshes), returns a response carrying any updated auth cookies. |

### Server reads — `lib/queries/`

| Path | What it does / how |
|------|--------------------|
| `queries/games.ts` | All reads for the **real** historical archive. `searchGames()` — the workhorse: queries the `game_search` view with team-name/abbreviation matching (resolves "BOS" → "Boston Celtics" against `*_teams` first, since the view's `title` never contains the abbreviation) and a postseason-phrase parser (`parsePlayoffPhrase` — "finals"/"nba finals"/etc. all mean "any postseason game"). `hasExtendedColumns()` probes once per server instance whether the `postseason`/abbr columns exist and degrades gracefully if not. `getOnThisDay()` — real completed games on today's calendar date across the last 12 years (12 parallel narrow date-range queries, since the view has no day-of-year index). `getGame()` — one game by sport+id. `escapeLike()` + `parsePlayoffPhrase()` have unit tests. |
| `queries/ratings.ts` | Reads for `public.ratings`. `getUserRatingForMatch()` / `getUserRatings()` — the current user's own. `getMatchReviews(matchId, currentUserId?)` — **every** user's reviews for a match, newest first, merged in app code with `profiles` display names (no FK to embed on) and best-effort `review_likes` counts/`likedByMe` (tolerates the table not existing). Returns the `MatchReview` shape. |
| `queries/profiles.ts` | `getDisplayName(userId)` — one field from `public.profiles`. |

### Server writes — `lib/actions/` (all `"use server"` Server Actions)

| Path | What it does / how |
|------|--------------------|
| `actions/auth.ts` | `authAction` — sign in / sign up. Sign-up passes a default `name` in metadata and returns `{ checkEmail: true }` (Supabase requires email confirmation, so there's no session yet). Sign-in redirects to `redirectTo` on success. |
| `actions/ratings.ts` | `saveRatingAction(matchId, log)` — upserts a row into `ratings` (`onConflict: user_id,match_id`); redirects guests to `/login?reason=rate`; `revalidatePath` for the match page and `/diary`. RLS enforces ownership; the `getUser()` check is just a nicer failure path. |
| `actions/profile.ts` | `updateDisplayNameAction` — **upserts** (not updates — an UPDATE matching zero rows silently "succeeds") `{id, display_name}` into `profiles`. `deleteAccountAction` — calls the `delete_own_account()` RPC, signs out, redirects home. |
| `actions/review-likes.ts` | `toggleReviewLikeAction(ratingId)` — checks `review_likes` for an existing row and deletes or inserts accordingly; returns `{ liked }` or `{ error }`. |
| `actions/reports.ts` | `reportReviewAction(ratingId)` — inserts `{reporter_id, rating_id}` into `reports`; returns `{ ok: true }` or `{ error }`. |
| `actions/games.ts` | `incrementGameView(sport, id)` — calls the `increment_game_search_count` RPC (there's no direct UPDATE policy on the games tables on purpose). Fired from `GameViewTracker` on mount, never from a server render (Next prefetches visible links, which would inflate counts). |

---

## 4. `ball-up-top/components/` — UI

Split into feature subfolders. `ui/` = shared primitives; `layout/` = chrome;
the rest = one folder per route area.

### `components/layout/`

| Path | What it does / how |
|------|--------------------|
| `Nav.tsx` | Sticky blurred top bar. Nav links (Home/Browse/Search/Diary) with active state, the spoiler-mode eye-icon toggle (`aria-pressed`), and either the signed-in avatar (initials) + "Sign out", or "Browsing as guest" + "Sign in". Hidden on `/login`. |
| `Footer.tsx` | Bottom bar: "Ball Up Top" + Privacy / Terms links. Hidden on `/login`. |
| `HomeGrid.tsx` | `"use client"`. Responsive `auto-fill minmax(280px,1fr)` grid of `MatchCard`s. Pulls `ratingsByMatch` + `hideScores` from the store and threads them into each card. Used on home and event pages. |
| `PopularReviews.tsx` | The home "Popular reviews" strip — one dense clickable row per top seed review (rating, user, "ABBR v ABBR" match context, truncated quote, flame + like count). `likes` is still mock/seeded, not a real vote. |
| `RegisterSW.tsx` | `"use client"`, renders nothing. `useEffect` registers `/sw.js` once on mount. (The service worker file existed for ages but was never registered until this.) |

### `components/match/`

| Path | What it does / how |
|------|--------------------|
| `MatchCard.tsx` | The standard match tile: sport chip + status pill, both sides (crest / name / score, score hidden when `hideScores`), community rating or "Not yet rated", and either "You rated X" or the log count. |
| `MatchDetailClient.tsx` | The big one — client half of the match page. Scoreboard (with the spoiler mask: for finished matches when `hideScores`, hides the score **and** the winner-dimming hint behind a "Reveal score" button). Merges real fan reviews (`realReviews`) above the mock `SeedReview`s into one `DisplayReview[]` list; real ones get `ReviewActions`. Right column: community-rating card with the **synthetic** distribution bars, and either the user's existing rating (with Edit) or a "Rate this match" CTA. Opens `RateModal`; on save calls `saveRatingAction`, toasts "Logged to your diary", refreshes. |
| `RateModal.tsx` | Centered modal dialog (web adaptation of the mockup's mobile bottom sheet). `RatingSlider` + "watched live" checkbox + tag pills + optional review textarea. Pre-fills from `existing` when editing. Enter/exit transition via a `show` flag. |
| `ReviewActions.tsx` | Like + Report buttons under a **real** fan review (needs a `ratingId`; not shown on mock seed reviews). Optimistic like toggle with rollback on error; report is one-shot ("Reported"). Guests are bounced to `/login?reason=rate`. |

### `components/browse/`, `diary/`, `event/`, `games/`, `search/`, `auth/`, `settings/`

| Path | What it does / how |
|------|--------------------|
| `browse/BrowseClient.tsx` | `/browse` UI. Text search + sport-filter pills over the mock `MATCHES` (client-side `.filter`). Empty state uses the MJ ASCII art. |
| `diary/DiaryClient.tsx` | `/diary` UI. Joins the user's `Rating[]` to mock `MATCHES`, shows summary stat cards (Logged / Avg rating / This year) then each logged match newest-first. Empty state = Wilt ASCII art. |
| `event/EventCard.tsx` | Home-page tile for a UFC fight card: main-event crests, name, venue, fight count. |
| `games/GameViewTracker.tsx` | `"use client"`, renders nothing. Fires `incrementGameView(sport, id)` once on mount (client-only, so link prefetch doesn't inflate counts). |
| `search/SearchClient.tsx` | `/search` UI. Debounced (300ms) text input + sport filter + recent/popular sort, all synced to the URL (`router.replace`) so a search is bookmarkable, and re-fetched via `/api/games/search`. Renders `GameResultCard`s; shows a Wilt-ASCII empty state. |
| `search/GameResultCard.tsx` | Result tile for a **real** historical game. Splits `title` on " vs " and, if team abbreviations are present, shows `TeamLogo` beside each side; otherwise the plain title. Shows the score if finished. Links to `/games/[sport]/[id]`. |
| `search/TeamLogo.tsx` | `"use client"`. Real-team logo **hotlinked from ESPN's CDN** by abbreviation (with a small override map for mismatched codes). Falls back to a deterministic colored monogram if the image 404s or there's no abbreviation. |
| `auth/LoginClient.tsx` | The full auth screen (own header, no `Nav`/`Footer`). Toggles sign-in / sign-up in place; sign-up success shows a "Check your email" state. Reads `?reason=` to show a contextual banner and pick the post-login redirect. Uses `useActionState(authAction)`. |
| `settings/SettingsClient.tsx` | `/settings` UI. Profile card (display-name form via `useActionState(updateDisplayNameAction)`, read-only email), Preferences card (spoiler-mode toggle), Sign-out card, and a red "Danger zone" with a two-step confirm that calls `deleteAccountAction`. |

### `components/ui/` — shared primitives

| Path | What it does / how |
|------|--------------------|
| `Button.tsx` | `"use client"`. The button/CTA primitive. Renders `<Link>` if `href` else `<button>`. Variants `primary`/`secondary`/`ghost` (each with its own `.bw-btn--*` hover in CSS), sizes `sm`/`md`/`lg`, `pill`, `fullWidth`, optional `icon`. `primary` also renders the dashed `ArcAccent` SVG (the "Lob" arc). |
| `Card.tsx` | Surface container. `<Link>` if `href` else `<div>`. `tone="accent"` = lime-tinted. Auto-adds the `.bw-card` hover lift when it's a link (or `hoverable`). |
| `Label.tsx` | Uppercase mono micro-label for section headings / field labels. Polymorphic via `as` (so real `<h2>`s keep semantics). `variant` `section`|`sub`. |
| `Icon.tsx` | One component, `if (name === …) return <svg>…` chain, ~17 inline icons. Intentionally **not** a `PATHS` lookup object (that was tried and dropped). Props: `size`, `stroke`, `fill`, `sw` (stroke width). |
| `Crest.tsx` | Team/competitor art for a **mock** `Side`, with the fallback chain: custom logo SVG (`LOGOS[side.abbr]`) → national flag (`FlagBadge`) → colored monogram (abbr on `side.color`). Always renders something. |
| `Logos.tsx` | `LOGOS` — hand-drawn team-logo SVGs keyed by `Side.abbr` (BOS, OKC, LAD, NYY, RMA, INT, MCI, BAY, EDM, FLA, NOR, VER). Only a subset of mock teams have one; the rest fall through `Crest`'s chain. |
| `FlagBadge.tsx` | Hand-drawn national-flag SVGs, one `if (code === …)` branch each (ar, br, in, es, it, ge, gb, us, mx, nl, au). Middle tier of `Crest`'s chain. |
| `Logo.tsx` | "The Lob" mark — ball arcing up a dotted path. `Logo` uses CSS vars; `LogoStatic` uses hardcoded hex for `next/og` contexts that can't resolve CSS custom properties. |
| `RatingValue.tsx` | `ratingColor(v)` — maps a 1–10 rating to a red→green **OKLCH** hue (`oklch(0.74 0.17 …)`); shipped and intentional, don't replace with a fixed color. `RatingValue` — the `8.5 /10` mono display in that color. Has unit tests. |
| `RatingSlider.tsx` | `"use client"`. Continuous 1.0–10.0 slider (`.rm-slider`, fill + thumb colored by `ratingColor`) with a big live number readout and quick-pick buttons (6, 7, 7.5, 8, 8.5, 9, 10). |
| `SportChip.tsx` | Small "● NBA" label — colored dot (`SPORTS[sport].color`) + uppercase mono name. |
| `StatusPill.tsx` | Renders a `Match`'s status: pulsing red "LIVE {clock}" badge, plain upcoming date, or muted "FINAL · {date}". |
| `TagPill.tsx` | `"use client"`. Generic rounded pill button (match tags, sport filters, sort toggles). `active` = filled accent; `small` variant. |
| `StatusPill` / `SportChip` / `TagPill` | (grouped above) — all pure presentational. |
| `BackLink.tsx` | "‹ Back" link atop detail pages (`href` defaults to `/`). Was duplicated inline in two places. |
| `EmptyState.tsx` | Centered ASCII-art illustration (`invert` + `mixBlendMode: screen` + per-image `opacity`) over a title/subtitle. Plain `<img>` (one source file hangs in the Next image optimizer). Used by the 404 and the three empty states. |
| `Toast.tsx` | `"use client"`. Fixed bottom-center toast bound to `useApp().toast`, check icon + message, `.rm-toast` slide-in. |
| `Skeleton.tsx` | Pulsing placeholder block (reuses `.rm-pulse`). Building block for every `loading.tsx`. |

---

## 5. `ball-up-top/lib/**/*.test.ts` — unit tests (Vitest)

Only **pure** logic is tested (no component/integration tests — no
testing-library installed). Run with `npm test`.

| Path | Covers |
|------|--------|
| `lib/to-user.test.ts` | `toUser()` name-fallback chain + null handling. |
| `lib/ratings-row.test.ts` | `toRating()` snake→camel mapping, numeric-string coercion, null-tags default. |
| `lib/time-ago.test.ts` | `timeAgo()` unit thresholds (uses fake timers). |
| `lib/queries/games.test.ts` | `escapeLike()` metachar escaping + `parsePlayoffPhrase()` keyword/sport/ case handling. |
| `components/ui/RatingValue.test.ts` | `ratingColor()` clamping at both ends + interpolation. |

---

## 6. `ball-up-top/scripts/` — one-off backfill jobs (run with `npx tsx`)

Server-only. Use `SUPABASE_SERVICE_ROLE_KEY` + `BALL_DONT_LIE_API_KEY` from
`.env.local`. **Never imported by app code.**

| Path | What it does / how |
|------|--------------------|
| `scripts-supabase-client.ts` | Exports a `supabase` client built with the **service-role** key (loads `.env.local` via `dotenv` relative to the script). Shared by every script below. |
| `backfill-lib.ts` | The shared engine. `backfillBySeasonRange()` — pages a per-season games endpoint, upserts each page, checkpoints after every page (so a crash resumes). Paces calls at a steady `60s / 5 = 12s` interval (bursting all 5 then sleeping tripped balldontlie's real rate limit). `withRetry()` — 3 attempts, waits out a full window on HTTP 429. `loadCheckpoint`/`saveCheckpoint`. |
| `backfill.ts` | NBA games, seasons 1985–2025 (1946–1984 were a separate earlier run). Maps balldontlie NBA game → row, upserts into `nba_games`. |
| `backfill-nfl.ts` | NFL games, 2002–2025 (2002 is the real data floor — earlier seasons return nothing). Upserts `nfl_games`, builds `title` from team full names. |
| `backfill-mlb.ts` | MLB games, 2000–2025 (2000 is the floor; 2000–2001 have far fewer games — a real provider gap, not a bug). Scores come from `home/away_team_data.runs`. Upserts `mlb_games`. |
| `backfill-teams.ts` | One-shot (team lists are small + unpaginated). Upserts `nba_teams` / `nfl_teams` / `mlb_teams` (id, conference/league, division, city, name, full_name, abbreviation). |
| `backfill-postseason.ts` | `UPDATE`s `postseason = true` on **existing** rows returned by balldontlie's own `postseason` filter, all three sports across full history (~15–20 min, not a full re-backfill). Regular-season rows stay `NULL`. **Requires the `postseason` column** (see `supabase/migrations/20260906000001`). Ran to completion 2026-09-06. (It originally used `upsert` and inserted 68 junk id-only rows into `nba_games` — now `UPDATE`-only.) |
| `_check-db.ts` | Diagnostic (not a backfill). Prints row counts + per-season coverage/gaps for the games tables, with OpenAPI introspection fallback for empty tables. |
| `_check-rls.ts` | Diagnostic. Probes each table's REST endpoint with the anon key to see what RLS actually allows. |
| `.backfill-checkpoint.json`, `.backfill-mlb-checkpoint.json`, `.backfill-nfl-checkpoint.json` | Per-script progress markers (`{season, cursor, totalImported, completedSeasons}`). Git-ignored, machine-local. A `.backfill-postseason-<sport>-checkpoint.json` trio is created when that script runs. |

---

## 7. `ball-up-top/public/` — static assets

| Path | What it is |
|------|------------|
| `sw.js` | The service worker. Network-first, cache-fallback for GET requests; caches `/` as the offline shell; cleans old caches on activate. Registered by `RegisterSW.tsx`. |
| `Lebron-Lob-ASCII.png`, `MJ-3peet-ASCII.png`, `Wilt-100-ASCII.png` | ASCII-art portraits used in `EmptyState` (no-reviews, 404/no-results, empty-diary respectively). |
| `favicon.ico` | Legacy tab icon (the dynamic `app/icon.tsx` is the real one). |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Leftover `create-next-app` sample icons. Unused. |

---

## 8. The abandoned prototypes (for completeness)

### `sports-letter/`
Original Create-React-App attempt under the first project name. `src/App.js` is
the **unmodified CRA spinning-logo demo**; `src/index.js`, `reportWebVitals.js`,
`setupTests.js`, `App.test.js`, the CSS, and `public/` are all stock CRA output.
`build/` is a stale production build of that demo page. `package.json` = CRA
defaults (`react-scripts`). Nothing here reflects the current app.

### `sports-letter/my-app/`
A second `create-react-app` run nested inside the first, even less touched — same
stock files, no `build/`. Effectively an accident; ignore.

---

## Quick "where do I…" index

| I want to… | Look at |
|------------|---------|
| Change what games show on the home feed / browse | `lib/data.ts` (mock data) |
| Change real game search behaviour | `lib/queries/games.ts` (+ `app/api/games/search/route.ts`) |
| Touch auth | `lib/actions/auth.ts`, `lib/supabase/*`, `proxy.ts` |
| Change how a rating is saved | `lib/actions/ratings.ts` + `components/match/RateModal.tsx` |
| Restyle something | `app/globals.css` tokens + the component's inline `style={{}}` |
| Add an icon | `components/ui/Icon.tsx` (add an `if` branch) |
| Add a route | server `page.tsx` + `components/<area>/<Name>Client.tsx` (see `architecture.md`) |
| Change the DB schema | add a file to `supabase/migrations/` **and** apply it to the live project |
