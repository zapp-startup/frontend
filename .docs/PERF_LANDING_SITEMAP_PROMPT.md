# Zapp — Performance, Landing Page, Sitemap & Scroll-Animation Implementation Prompt

> Self-contained build brief. Safe to run cold in a fresh session.

## Role & context

You are implementing performance, UX, and structural features in the **Zapp** repo:
- **Frontend:** Vite + React 18 + TypeScript (`frontend/`). Routing via `react-router-dom` v7. UI via MUI + Radix + Tailwind v4. **`motion` (Framer Motion v12) is already installed** — use it for animation; do **not** add another animation lib.
- **Backend:** Django 6 + DRF (`backend/`). Auth is **Supabase JWT** verified server-side (`apps/users/supabase_auth.py`); app data is Django-owned Postgres hosted on Supabase. OpenAI powers the AI chat (`OPENAI_API_KEY`, `gpt-4.1-mini`).

## Global rules (must follow)

- Obey `CLAUDE.md` and `.claude/rules/index.md`. For frontend work read `.claude/navigation-frontend/index.md`; for backend read `.claude/navigation-backend/index.md`, then the feature/app file.
- Keep page code in the owning `frontend/src/features/<feature>/` folder; reusable UI in `shared/components/system/` (drop to `shared/components/ui/` only if needed). Put backend calls in `frontend/src/api/*.api.ts` via the `apiRequest` client — never `fetch` directly from pages.
- Backend: business logic in `backend/apps/<app>/` (`services/` for non-trivial logic); keep querysets user-scoped; management commands under `management/commands/`.
- **No new top-level frameworks/deps when an installed one suffices** (`motion`, DRF, `apiRequest`, Radix/MUI).
- Add/adjust focused tests when behavior changes. Respect `prefers-reduced-motion` for all motion.
- **Verify before declaring done:** `cd frontend && npm run build && npm run test:run`; run the relevant `backend/apps/*/tests*.py`.
- **DB/migrations:** author schema changes as Django model edits → `makemigrations`; review the generated ops; apply over the **Supabase session pooler (port 5432)**, never the transaction pooler (6543). Swap the port on the existing pooler host/creds in `backend/.env`.

## Recommended execution order

1 (DB indexing) → 7 (landing + `/home`) → 8 (sitemap) → 2 (images) → 3 (lazy loading) → 6 (scroll animations) → 5 (transactions pagination) → 4 (AI streaming).
Each workstream is independently shippable.

---

## 1. Database indexing

**Goal:** Remove redundant/unused indexes; fix stale stats. Full audit already exists.

**Where:** `backend/.docs/DB_AUDIT_AND_INDEXING.md`; models in `backend/apps/*/models.py`.

**Approach:**
- Execute **Phase 1** of the audit: run `ANALYZE;`; drop the 11 exact-duplicate `models.Index`es (e.g. `ai_userfact`, `users_userpreference`, `subscriptions_merchant`, gamification ×5, `valuations_valuationmodelversion`, the double `spotify_user_id` index); remove `db_index=True` from the six unused `compliance_auditevent` CharFields (`event_name, outcome, actor_type, source_system, request_id, resource_type`).
- One migration (expect `RemoveIndex`/`AlterField`). Review, then apply over 5432.
- Keep indexes with real scans or a backing query; never touch unique constraints.

**Acceptance:** Migration applies cleanly; `migrate --check` + `makemigrations --check` clean; no query loses a needed index.

---

## 2. Image compression + modern formats (WebP/AVIF)

**Goal:** Serve raster images compressed as WebP (with fallback), automatically at build time.

**Where:** brand logos in `frontend/private/` (the Vite `publicDir` is **`private/`**, not `public/`): `zap-logo-white-Photoroom.png`, `zap-logo-black-Photoroom.png`, `logo-mark.png`; used by `shared/components/brand/AppLogo.tsx`. Also images in `features/auth/components/MfaEnrollmentCard.tsx` and `features/auth/pages/MfaPage.tsx`.

**Approach:**
- Add a build-time optimizer in `vite.config.ts` (e.g. `vite-plugin-image-optimizer`, or `vite-imagetools` for `?format=webp&as=srcset`) producing `.webp` (optionally `.avif`) beside originals.
- Build a reusable `<Image>` in `shared/components/system/` rendering a `<picture>` (WebP `source` + original fallback) with `loading="lazy"` + `decoding="async"`; route logo/MFA `<img>` usages through it.

**Constraints:** No visual regression; keep PNG fallback; reserve dimensions to avoid layout shift; don't bloat the bundle.

**Acceptance:** Build emits WebP; network panel shows WebP to modern browsers; images render identically.

---

## 3. Lazy loading for content + images (on scroll)

**Goal:** Defer offscreen images and heavy sections until they near the viewport.

**Where:** new primitives in `shared/components/system/`; apply on list/feed/section-heavy pages (transactions, analytics, dashboard home, circles/badges) and the landing page.

**Approach:**
- `LazyImage` (extends `<Image>` from #2): show a skeleton/placeholder until an `IntersectionObserver` / `motion`'s `useInView` signals approach, then load `src`.
- `LazyMount`/`<Deferred>`: mount heavy below-the-fold sections only when in view. (Route-level `React.lazy` already exists in `features/dashboard/layout/DashboardLayout.tsx` — don't duplicate; this is content-level.)

**Constraints:** Real `alt`; reserve aspect-ratio to avoid CLS; respect `prefers-reduced-motion`.

**Acceptance:** Offscreen images absent from initial requests, load on scroll; no layout shift.

---

## 4. Stream the AI chatbot response

**Goal:** Render the assistant reply token-by-token as it arrives.

**Where:** backend `backend/apps/ai/` (`views.py` `MessageViewSet`, `services/`, `urls.py` — DRF router with `conversations`/`messages`/`user-facts` viewsets); frontend `frontend/src/api/ai.api.ts` (`sendMessage`) and `frontend/src/features/dashboard/components/ZappBot.tsx`.

**Approach:**
- **Backend:** add a streaming endpoint (e.g. `POST /api/ai/conversations/{id}/messages/stream/`) returning a `StreamingHttpResponse` as **SSE** (`text/event-stream`), proxying OpenAI with `stream=True`. Persist the full user+assistant messages at stream end so history matches the non-streaming path. Keep `SupabaseJWTAuthentication` + user scoping. Disable buffering (`X-Accel-Buffering: no`; ensure ASGI/uvicorn flushes).
- **Frontend:** add `sendMessageStream(...)` in `ai.api.ts` using `fetch` + `ReadableStream` `getReader()` (so the Bearer auth header works — not `EventSource`), exposing text deltas via callback/async-iterator. In `ZappBot.tsx`, append a placeholder assistant message and update its text as chunks arrive; finalize with returned metadata. Keep graceful fallback to `sendMessage` if streaming fails; preserve the existing 404 / new-conversation retry logic; abort on unmount.

**Acceptance:** Text visibly streams; final saved message matches; refresh shows persisted reply; fallback works when streaming unavailable.

---

## 5. Pagination for transactions

**Goal:** Load transactions in pages so the list renders fast.

**Where:** backend `backend/apps/transactions/views.py` (`TransactionViewSet` — currently manual `limit` slicing in `get_queryset`); frontend `frontend/src/api/transactions.api.ts` (`list`/`recent`) and the Transactions page under `features/transactions/`.

**Approach:**
- **Backend:** replace manual `limit` slicing with DRF **`CursorPagination`** (ordered by `-occurred_at`/`-created_at` — stable, no COUNT). Set it **per-viewset** (`pagination_class`), not globally, to avoid changing other list endpoints. Preserve filters (`category, direction, date_from, date_to`); keep the `recent(limit=6)` use case working.
- **Frontend:** add a paginated list method returning `{ results, next }`; update the Transactions page to infinite-scroll via an IntersectionObserver sentinel (reuse #3), appending pages. Leave `recent()` (dashboard widget) unchanged.

**Constraints:** No regression to filters or the `recent` widget; type the paginated response.

**Acceptance:** First page loads fast; scrolling loads more; filters still work; dashboard "recent" unaffected.

---

## 6. Scroll-triggered animations throughout

**Goal:** Consistent reveal-on-scroll motion across the app.

**Where:** new `Reveal` / `RevealStagger` in `shared/components/system/`; apply across feature pages and public/landing routes.

**Approach:**
- Use installed **`motion`**: `whileInView` with `viewport={{ once: true, margin: "-10% 0px" }}` + shared variants (fade-up, stagger children). `<Reveal>` for single elements, `<RevealStagger>` for lists/grids — one-line usage. Apply to section headers, cards, list items, and landing hero/sections. Subtle durations (~0.3–0.5s).

**Constraints:** **Respect `prefers-reduced-motion`** (no motion when set); `once: true` (no re-animate on re-render); no CLS; don't double up with `tw-animate-css` on the same element.

**Acceptance:** Sections animate in once on scroll; reduced-motion users see none; no jank/CLS; build + tests pass.

---

## 7. Public landing page + move dashboard home to `/home`

**Goal:** `/` becomes a public, short intro landing (reachable logged-out); the authenticated dashboard home moves to `/home`.

**Where:**
- `frontend/src/app/App.tsx` — top-level routes + `RootRoute` (currently `/` → authed `DashboardLayout` else `LandingPage`; `*` → `DashboardLayout`).
- `frontend/src/features/dashboard/layout/DashboardLayout.tsx` — `NAV_ITEMS` (home is `{ id:"home", path:"/", label:"Dashboard" }`, ~line 70) and `ROUTES` (`/` → `<HomePage />` with `match: pathname === "/"`, ~line 90); logo `NavLink to="/"` (~line 181).
- `frontend/src/features/home/` — dashboard `HomePage` (content unchanged, new path).
- Existing `frontend/src/LandingPage.tsx` (also used at `/waitlist`) — repurpose, or supersede with a dedicated intro under new `frontend/src/features/marketing/` (or `features/landing/`), per `.claude/rules`.

**Approach:**
- **Routing:**
  - `/` → **public landing** (no auth). If authenticated, **redirect `/` → `/home`** (decided default).
  - `/home` → authenticated dashboard home inside `DashboardLayout` (which already redirects unauthenticated users to `/login`).
  - In `DashboardLayout`, change home `NAV_ITEM` path to `/home`, update its `ROUTES` entry (`path:"/home"`, `match: pathname === "/home"`), and fix logo/home links + active-state checks. Audit every `to="/"` / `navigate("/")` / `pathname === "/"`.
  - Keep `/waitlist` and all other routes working; preserve deep links; gate redirects on `isAuthReady` (no flash of dashboard).
- **Landing content:** short single-scroll intro — hero (name + one-line value prop + primary **Sign up** / secondary **Log in** CTAs), 3–4 feature highlights (transactions insight, subscriptions/value score, AI assistant, gamification), footer. On-brand dark theme (`bg-[#0B1220]`). Showcase #6 (scroll reveals), #3 (lazy loading), #2 (WebP imagery).

**Constraints:** Don't break `/login`, MFA, onboarding, or the `*` catch-all. Logged-out users must see the landing without being forced through auth.

**Acceptance:** Logged-out `/` shows the intro; CTA reaches signup/login; logged-in `/` lands on `/home`; dashboard home renders at `/home` with correct nav highlight; all existing routes resolve; build + routing tests pass.

---

## 8. Sitemap + robots generation (auto-refreshed on every build)

**Goal:** `sitemap.xml` + `robots.txt` that always reflect current public routes, regenerated on every build — no manual upkeep.

**Where:**
- `frontend/vite.config.ts` — add a build plugin. ⚠️ Output must reach the Vite **publicDir (`private/`)** or be emitted to the build output dir, or it won't be served.
- New canonical routes manifest `frontend/src/app/routes.public.ts`, imported by both the generator and `App.tsx` (single source of truth).
- `frontend/.env.example` — add `VITE_SITE_URL` (e.g. `https://app.your-domain.com`) for absolute URLs.

**Approach:**
- Single source of truth for public/indexable routes: `/` (landing), `/login`, `/signup`, `/waitlist`, `/privacy`. **Exclude** auth-gated/transient: `/home`, `/transactions`, `/subscriptions`, `/analytics`, `/profile`, `/circles`, `/badges`, `/targets`, `/reviews/*`, `/auth/callback`, `/mfa*`, `/onboarding`, `/integrations/*`.
- Dependency-light Vite plugin (`closeBundle`/`writeBundle` hook) — or `vite-plugin-sitemap` — that, on every build, reads the manifest + `VITE_SITE_URL` and writes:
  - `sitemap.xml` (one `<url>` per public route; `<lastmod>` = build time; sensible `changefreq`/`priority`).
  - `robots.txt` (`Allow` public, `Disallow` auth-gated, `Sitemap: ${VITE_SITE_URL}/sitemap.xml`).
- Also emit on dev-server start for local testing. Because it derives from the manifest, route changes propagate automatically.
- Add baseline SEO to `index.html`: `<meta name="description">`, `<link rel="canonical">` (and OG/Twitter tags on the landing).

**Constraints:** SPA route discovery is **frontend build-time**, not Django. No private URLs in the sitemap. Generator self-contained (no network). Verify the file actually serves at `/sitemap.xml` given `publicDir: 'private'`.

**Acceptance:** After `npm run build`, `dist/sitemap.xml` + `dist/robots.txt` exist with correct absolute URLs and exclude auth routes; adding a public route to the manifest regenerates on next build with no other edits; `/sitemap.xml` and `/robots.txt` resolve when served.

---

## Global done criteria

- `cd frontend && npm run build && npm run test:run` pass; relevant backend app tests pass.
- No new top-level frameworks; reuse `motion`, DRF, `apiRequest`, and `shared/components/system/` primitives.
- New behavior has focused tests (streaming chunk handling, pagination append, lazy-load trigger, `Reveal` reduced-motion, routing redirects, sitemap output).
- DB migration applied over the 5432 session pooler; Supabase security note (RLS off / `anon` `CREATE` on `public`) from the audit handled separately if in scope.
