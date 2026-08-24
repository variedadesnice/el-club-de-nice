# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server at http://localhost:5173 (proxies /api to Python backend)
npm run build    # Build static frontend (vite build → dist/)
npm run preview  # Preview the production build locally
npm run lint     # TypeScript type check (no emit)
```

No test suite exists. Type check with `npm run lint` to validate.

The **Python FastAPI backend** (separate repo, sibling directory `Club-de-nice-BACKEND`) must also be running at `http://localhost:8000` for the app to work:
```bash
# from Club-de-nice-BACKEND
uvicorn main:app --reload --port 8000
```

## Environment Variables

### Frontend (`.env` — copy from `.env.example`)
- `VITE_API_URL` — URL of the Python backend exposed to the browser (e.g. Railway URL for prod). When absent, `API_BASE` defaults to `""` and the Vite dev server proxies `/api/*` to `PYTHON_BACKEND_URL` (default `http://localhost:8000`, see `vite.config.ts`).
- `GEMINI_API_KEY` — Google Gemini AI key (AI Studio leftover, currently unused by `src/`)
- `APP_URL` — hosting URL (injected automatically in production)

### Python backend (its own `.env`)
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — Supabase credentials for all FastAPI routes

## Architecture

This repo is a **pure Vite/React SPA**. All API logic lives in the separate Python FastAPI backend repo (`Club-de-nice-BACKEND`). There is **no direct Supabase client usage anywhere in `src/`** — `@supabase/supabase-js` is not used; all auth and data access goes through the backend API. A Google OAuth experiment was added and then fully reverted (`Remove direct Supabase client auth from frontend`) — don't reintroduce direct Supabase auth in this repo.

### Dev server
`vite.config.ts` proxies `/api/*` to `PYTHON_BACKEND_URL` (default `http://localhost:8000`) so the frontend can call relative `/api/...` paths during local development without CORS issues.

### Production
- **Vercel**: `vercel.json` does a pure static build (`vite build` → `dist`) with SPA rewrites to `index.html`. The browser calls the Python backend directly cross-origin via `VITE_API_URL`.

### Python backend (separate repo)

FastAPI app with all active API logic. Uses a single Supabase client with the **service role key** (admin privileges). Auth is validated server-side via `supabase.auth.get_user(token)` on each protected request.

Auth levels: `—` = public · `🔑` = authenticated user · `🔓` = active-subscription user · `👑` = admin · `?` = optional (user info used if present)

#### `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account + default profile |
| POST | `/api/auth/login` | — | Sign in, returns `{ user, token }` |
| GET | `/api/auth/me` | 🔑 | Get current user profile |
| POST | `/api/auth/avatar` | 🔑 | Upload avatar (base64 → Supabase Storage) |
| PUT | `/api/auth/profile` | 🔑 | Update name / bio / gender / city / phone / birthdate |

#### `/api/posts`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts/` | ? | Cursor-paginated feed (`limit`, `cursor`, `tags` query params) |
| POST | `/api/posts/` | 🔑 | Create post |
| GET | `/api/posts/me/social-impact` | 🔑 | Aggregate "social impact" stat used on Profile |
| PATCH | `/api/posts/{post_id}` | 🔑 | Edit post content / image |
| DELETE | `/api/posts/{post_id}` | 🔑 | Delete post |
| POST | `/api/posts/{post_id}/pin` | 🔑 | Toggle pin on post |
| POST | `/api/posts/{post_id}/react` | 🔑 | Add/change reaction |
| GET | `/api/posts/{post_id}/reactions` | — | List reactions |
| GET | `/api/posts/{post_id}/comments` | ? | List comments |
| POST | `/api/posts/{post_id}/comments` | 🔑 | Add comment |
| POST | `/api/posts/{post_id}/comments/{comment_id}/react` | 🔑 | React to comment |
| GET | `/api/posts/{post_id}/comments/{comment_id}/reactions` | — | List comment reactions |

#### `/api/courses` — legacy, still the primary admin CRUD path
The frontend's classroom admin UI (`CreateCourseSheet`, `AddChapterForm`, course/chapter editing in `CourseDetail`) calls this router, **not** `/api/admin/classroom`, for create/update/list of courses and chapters.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/courses/` | — | List all courses |
| POST | `/api/courses/` | 🔑 | Create course |
| POST | `/api/courses/thumbnail` | 🔑 | Upload thumbnail (base64 → Supabase Storage) |
| PUT | `/api/courses/{course_id}` | 🔑 | Update course (title, description, thumbnail, category) |
| GET | `/api/courses/{course_id}/chapters` | — | List chapters (ordered by sort_order) |
| POST | `/api/courses/{course_id}/chapters` | 🔑 | Add chapter (title ≤150 chars, duration ≤20 chars) |
| PUT | `/api/courses/{course_id}/chapters/{chapter_id}` | 🔑 | Edit chapter (title, videoUrl, duration) |

#### `/api/classroom` and `/api/admin/classroom` — newer surface
Used specifically for: chapter PDFs (upload/list/delete), chapter deletion, course publish toggle, and student progress/completion tracking.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/classroom/me/completed-courses` | 🔑 | `{completedCourses}` — used on Profile stats |
| GET | `/api/classroom/chapters/{chapter_id}/pdfs` | 🔓 | List PDFs for a chapter — used by `ActiveChapterPdfs` |
| GET | `/api/classroom/courses/{course_id}/progress` | 🔓 | Per-user progress — **not yet called from the UI** (`CourseDetail` still shows the static `course.progress` field) |
| POST | `/api/classroom/courses/{course_id}/chapters/{chapter_id}/complete` | 🔓 | Mark chapter complete (also not yet wired into the UI) |
| DELETE | `/api/admin/classroom/courses/{course_id}/chapters/{chapter_id}` | 👑 | Chapter deletion — used by `CourseDetail` |
| POST | `/api/admin/classroom/chapters/{chapter_id}/pdfs` | 👑 | Upload chapter PDF — used by `AddChapterForm` / `ChapterPdfsAdmin` |
| PATCH/DELETE | `/api/admin/classroom/chapters/{chapter_id}/pdfs/{pdf_id}` | 👑 | Edit/delete chapter PDF |

#### `/api/tags`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tags/` | — | List all tags |
| POST | `/api/tags/` | 🔑 | Create tag |
| DELETE | `/api/tags/{tag_id}` | 🔑 | Delete tag |

#### `/api/invitations`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/invitations/` | 👑 | Generate invite link |
| GET | `/api/invitations/` | 👑 | List all invitations |
| DELETE | `/api/invitations/{invitation_id}` | 👑 | Delete invitation |
| GET | `/api/invitations/validate` | — | Validate invite token (`?token=`) |
| POST | `/api/invitations/use` | — | Mark invite token as used |

#### `/api/payments`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payments/upload-receipt` | — | Upload receipt image (base64 → Supabase Storage), returns `{ path }` |
| POST | `/api/payments/register` | — | Register account + payment in one step (wizard flow). Body includes `payment_method_id`, `currency_id`, `amount`, `amount_local`, `exchange_rate` (frozen BCV rate at submit time) |
| GET | `/api/payments/` | 👑 | List all payments (admin panel) |
| GET | `/api/payments/{user_id}` | 🔑 | Get payments for a specific user |
| PATCH | `/api/payments/{payment_id}/approve` | 👑 | Approve payment (triggers `sync_subscription_status`) |
| PATCH | `/api/payments/{payment_id}/reject` | 👑 | Reject payment |
| GET | `/api/payments/{payment_id}/receipt` | 👑 | Get signed URL for receipt image |

#### `/api/payment-methods` and `/api/admin/payment-methods` — payment method catalog
Admin-configurable catalog of payment instructions (bank transfer, mobile payment, etc.), each with dynamic fields (text/email/phone/number) and static display values. Surfaced in `Register.tsx` step 2 as a selectable grid with a "tap to copy" panel for each field.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/payment-methods/` | — | Active methods with fields/values, used in Register wizard |
| GET | `/api/admin/payment-methods/` | 👑 | All methods incl. inactive |
| POST/PATCH/DELETE | `/api/admin/payment-methods/{...}` | 👑 | Manage methods, fields, and values — used by `PaymentMethodsPanel` |

#### `/api/currencies` and `/api/admin/currencies` — multi-currency catalog
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/currencies/` | — | Active currencies, ordered by code |
| GET/POST/PATCH/DELETE | `/api/admin/currencies/{...}` | 👑 | Manage currency catalog (base currency, e.g. USD, can't be deactivated/deleted) |

> Note: the BCV (Bolívar) exchange rate itself is **not** sourced from this backend catalog — it's fetched client-side from a public rate API. See "BCV exchange rate integration" below.

#### `/api/levels` — Gamificación
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/levels/tiers` | — | Lista todos los rangos de nivel |
| GET | `/api/levels/me` | 🔑 | Nivel, XP y tier actual del usuario autenticado. Returns `{ user_id, level, xp_total, xp_current, xp_next, tier? }` |
| GET | `/api/levels/me/achievements` | 🔑 | Logros obtenidos por el usuario autenticado |
| GET | `/api/levels/me/xp-history` | 🔑 | Historial de XP paginado (`?limit=20&offset=0`) |
| GET | `/api/levels/{user_id}` | — | Nivel y tier de cualquier usuario (perfil ajeno) |
| POST | `/api/levels/award` | 🔑 | Procesa un logro para el usuario autenticado. Body: `{ achievement_code, metadata? }`. Llamar desde otros endpoints, no directamente desde el cliente. |

#### `/api/achievements`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/achievements/` | — | Catálogo público de todos los logros activos |

#### `/api/streaks` — racha diaria
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/streaks/checkin` | 🔑 | Registra el login de hoy, devuelve la racha y `milestone_reached?` — llamado desde `Profile.tsx` |
| GET | `/api/streaks/me` | 🔑 | Racha actual sin registrar check-in |

#### `/api/lives` — Lives (livestream, chat, reacciones, PDFs)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/lives/` | 🔓 | Lista de lives (activo primero), cacheado 5s en Redis — polled cada 10s/30s por el frontend |
| GET | `/api/lives/active` | 🔓 | Live activo actual o null |
| GET | `/api/lives/{live_id}/chat` | 🔓 | Últimos mensajes de chat (`?limit=50&after=`) |
| POST | `/api/lives/{live_id}/chat` | 🔓 | Enviar mensaje, broadcast vía WebSocket |
| WS | `/api/lives/{live_id}/chat/ws?token=<jwt>` | 🔓 | Canal de chat en tiempo real |
| GET / POST | `/api/lives/{live_id}/reactions` / `/react` | 🔓 | Reacciones (toggle: mismo tipo quita, distinto reemplaza) |
| GET | `/api/lives/{live_id}/pdfs` | 🔓 | PDFs del live |

#### `/api/admin/lives` — Admin Lives
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST/PATCH/DELETE | `/api/admin/lives/{...}` | 👑 | Crear/editar/eliminar live, activar/desactivar (exclusivo — desactiva otros lives activos) |
| POST/DELETE | `/api/admin/lives/{live_id}/pdfs/{...}` | 👑 | Gestionar PDFs |
| PATCH/DELETE/POST | `/api/admin/lives/{live_id}/chat/{message_id}` `/pin` | 👑 | Moderar chat (editar/eliminar/fijar mensaje), broadcast vía WS |

#### `/api/admin/analytics` — Analítica admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/analytics/overview` | 👑 | Resumen miembros + ingresos en tiempo real |
| GET | `/api/admin/analytics/members` | 👑 | Detalle de miembros (género, ciudad, rango de edad) |
| GET | `/api/admin/analytics/revenue` | 👑 | Detalle de ingresos |
| GET | `/api/admin/analytics/history` | 👑 | Histórico de snapshots diarios |
| POST | `/api/admin/analytics/snapshot` | 👑 | Fuerza snapshot del día |

#### `/api/admin/levels` — Admin gamificación
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/levels/users` | 👑 | Lista todos los usuarios con su nivel y XP |
| POST | `/api/admin/levels/award` | 👑 | Otorga XP manualmente. Body: `{ user_id, xp_amount, reason }` |
| GET | `/api/admin/levels/tiers` | 👑 | Lista rangos de nivel |
| POST | `/api/admin/levels/tiers` | 👑 | Crea nuevo rango |
| PATCH | `/api/admin/levels/tiers/{tier_id}` | 👑 | Edita rango existente |
| POST | `/api/admin/levels/tiers/icon` | 👑 | Sube icono al bucket `level-tier-icons`. Body: `{ imageData }` → `{ url }` |

#### `/api/admin/achievements` — Admin logros
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/achievements/` | 👑 | Lista todos los logros incluyendo inactivos |
| POST | `/api/admin/achievements/` | 👑 | Crea nuevo tipo de logro |
| PATCH | `/api/admin/achievements/{achievement_id}` | 👑 | Edita logro existente |
| POST | `/api/admin/achievements/icon` | 👑 | Sube icono al bucket `achievement-icons`. Body: `{ imageData }` → `{ url }` |

### Frontend (`src/`)

React 19 SPA with `react-router-dom` v7, feature-based folder structure:

```
src/
  context/AuthContext.tsx        — global auth state (user, token, updateUser, login, logout)
  lib/
    api.ts                       — apiFetch(), useApiFetch() hook, API_BASE constant
    permissions.ts               — isAdmin(), needsActiveSubscription(), hasActiveSubscription()
  routes/index.tsx               — authRoutes + appRoutes arrays (react-router-dom Route definitions)
  features/
    auth/components/
      Login.tsx                  — login form (email/password only — no OAuth)
      Register.tsx                — 3-step payment-registration wizard (plan → payment method/currency → receipt upload), BCV rate fetched live
      InviteRegister.tsx          — register via invitation link (auto-login after register)
      AccountStatus.tsx           — subscription gating screen for inactive/pending/expired accounts
      SessionExpired.tsx          — shown when the JWT is rejected mid-session
    landing/                      — pre-auth landing page
    onboarding/OnboardingModal.tsx — first-login onboarding flow
    muro/                         — social feed
      components/ CreatePost, PostCard, PostFeed, CommentSection
      hooks/ usePosts, useComments
    live/                         — live streaming feature (route: /live)
      components/ LiveView (container), LivePlayer (YouTube embed), LiveChat (WS chat),
                   LiveReactions (emoji toggle), LivePdfs (admin upload + list)
    classroom/
      components/ Classroom, CourseCard, CourseDetail, CreateCourseSheet, AddChapterForm,
                   ActiveChapterPdfs (student PDF view), ChapterPdfsAdmin (admin PDF manage)
      hooks/ useCourses, useCourseChapters, useChapterPdfs
    profile/
      components/ Profile, ProfileHero, ProfileStatsGrid, ProfileLevelCard, ProfileAchievements,
                   ProfileActivity, ProfileRanking, ProfileEditSheet
      data/profileMock.ts          — ranking/activity table data only; level/XP/achievements/streak/
                                     completed-courses/social-impact are now real API data (see below)
    admin/
      AdminDashboard.tsx, AnalyticsPanel.tsx, GamificationPanel.tsx, PaymentMethodsPanel.tsx
      (+ existing invitations/payments tabs)
  shared/layout/Layout.tsx       — nav shell (sidebar desktop + bottom nav mobile)
  types.ts                       — shared TypeScript interfaces
```

### Auth & routing flow

`App.tsx` contains three render branches:

1. **Not authenticated** (`!isAuthenticated`) → renders auth routes (landing / login / register / invite)
2. **Authenticated but subscription not active** (`needsActiveSubscription(role) && !hasActiveSubscription(subscription_status)`) → renders `<AccountStatus />` (gating screen)
3. **Authenticated + active** → renders `<Layout>` with app routes (muro, live, classroom, profile, admin)

JWT token stored in `localStorage` under `edu_token`, user object under `edu_user`. Both are read synchronously at mount via `useState` lazy initializers in `AuthProvider`.

`isAuthenticated` is derived from `!!user` (not from token). Always ensure `login(user, token)` is called together — never call `updateUser()` as a substitute for `login()`.

**No direct Supabase auth**: `@supabase/supabase-js` is not used anywhere in `src/`. A Google OAuth experiment was added (`feat: implement Google authentication via Supabase`) and then fully removed (`Remove direct Supabase client auth from frontend`) — all auth is email/password via the backend API.

### Subscription & payments

Users have a `subscription_status` field on their `profiles` row: `inactive | active | expired`.

A Postgres trigger (`sync_subscription_status`) on the `payments` table automatically recalculates and writes `profiles.subscription_status` whenever a payment row is inserted or updated.

Payment statuses: `pending` (awaiting admin review) → `success` (approved, sets `expires_at`) or `failed` (rejected).

Roles that require an active subscription: `miembro`. Roles exempt from gating: `admin`, `invitado`.

### Multi-currency & payment methods (Register wizard)

- Step 2 fetches `/api/payment-methods/` and renders a selectable grid of configured methods (e.g. "Transferencia Bancaria", "Pago Móvil"); selecting one shows a `CopyField` panel with all of the method's dynamic fields as tap-to-copy buttons.
- The wizard fetches the BCV rate from the public API `https://ve.dolarapi.com/v1/dolares/oficial` (field `promedio`) on mount and pre-fills/locks the amount field as `planPriceUSD * bcvRate`, displayed in Bs. If the fetch fails, the amount field stays editable and uncoverted.
- Final submission to `POST /api/payments/register` sends `payment_method_id`, `currency_id`, `amount` (USD), `amount_local` (Bs), and `exchange_rate` (the frozen rate) — the backend stores all of these verbatim, it does not re-fetch or recompute rates.
- Phone validation: 7–15 digits total, with a country-code dropdown (🇻🇪 +58, 🇺🇸 +1, 🇲🇽 +52, 🇨🇴 +57, 🇦🇷 +54, 🇵🇪 +51, 🇨🇱 +56, 🇪🇸 +34, 🇵🇦 +507, 🇩🇴 +1) prepended to the digits before submission.

### Admin financial analytics (`AnalyticsPanel.tsx`)

Fetches the same BCV rate API in parallel with `/api/admin/analytics/*` data. `formatAmount(amount, rate?)` divides Bs amounts by the rate to display a USD-equivalent figure on KPI cards, revenue history, and plan breakdown — falls back to a raw dollar format if the rate fetch fails.

### Live streaming (`src/features/live/`, route `/live`)

- `LiveView.tsx` is the container: shows the YouTube embed via `LivePlayer`, polls `GET /api/lives/` every 10s while a live is active or 30s while idle, and (for admins) exposes create/activate/deactivate/end/delete controls. It holds the **full** `/api/lives/` list in state and derives the active session and the scheduled list with `useMemo` — don't narrow the fetch to just the active live, the admin panel needs the rest.
- `ScheduledLivesPanel` (inside `LiveView.tsx`) is the **only** place in the app that can activate or delete an already-created live (`DELETE /api/admin/lives/{id}`). It lists every non-active session — upcoming, past-due, and undated — and renders in both branches (inside the left column when a live is on air, under the create form when not).
- The create form only auto-activates when `scheduledAt` is empty or already in the past; a future date leaves the live inactive so it shows up as scheduled. `scheduledAt` is sent as `toISOString()` (the `datetime-local` input yields a zoneless local string, which the backend would otherwise read in a different timezone).
- `LiveChat.tsx` connects over WebSocket to `/api/lives/{liveId}/chat/ws?token=...`, falling back to 3s REST polling on disconnect, with 3s reconnect backoff. Admins can edit/pin/delete any message inline; pinned messages show in an amber banner.
- `LiveReactions.tsx` offers 👍❤️🔥👏😮, toggling via `POST /api/lives/{liveId}/react` (same type removes, different replaces), showing the top 3 + counts.
- `LivePdfs.tsx` lets admins upload PDFs (base64 → `/api/admin/lives/{liveId}/pdfs`) and everyone view/open them; delete is admin-only.

### Classroom & chapter PDFs

- Course/chapter CRUD (create, edit, list) goes through the **legacy** `/api/courses/*` router — see the endpoint table above. Don't assume `/api/admin/classroom` replaces it; it currently only owns chapter PDFs, chapter deletion, and course publish toggling.
- `CourseDetail.tsx` tracks the open chapter by **ID, not index** (`activeChapterId` state) so the selection survives chapter list mutations (add/delete/reorder). When the active chapter has no `videoUrl`, it renders an empty-state card ("Este capítulo no tiene un video enlazado...") instead of a blank player, and still shows `ActiveChapterPdfs` below it.
- `AddChapterForm.tsx` supports multi-file PDF/document attachment: chapter is created first via the legacy endpoint, then each file is uploaded individually to `/api/admin/classroom/chapters/{chapterId}/pdfs`.
- `ChapterPdfsAdmin.tsx` provides the same upload/delete UI scoped to an already-existing chapter (used during chapter edit).
- `ActiveChapterPdfs.tsx` (student view) lists PDFs for the currently open chapter via `useChapterPdfs(chapterId)` → `GET /api/classroom/chapters/{chapterId}/pdfs`.
- `course.progress` (shown on `CourseCard`) is a static integer column on the `courses` table — it is **not** computed from the newer `/api/classroom/.../progress` or `complete_chapter` endpoints, which exist server-side but aren't yet called from this UI.

### Profile page

- **Real data, fetched on mount in `Profile.tsx`**: level/XP (`GET /api/levels/me`), achievements (`GET /api/levels/me/achievements`), streak (`GET /api/streaks/checkin` — this also registers today's check-in), completed courses (`GET /api/classroom/me/completed-courses`), and social impact (`GET /api/posts/me/social-impact`). All passed as props into `ProfileLevelCard`, `ProfileAchievements`, and `ProfileStatsGrid`.
- `ProfileStatsGrid` renders badge count, streak days, completed courses, and social impact from real props — these were previously "Próximamente" placeholders backed by `profileMock.ts`.
- A milestone banner shows when `streak.milestone_reached` is set (e.g. "¡Hito de 7 días alcanzado!").
- **Still mock**: ranking and activity-feed tables in `profileMock.ts` remain static.
- Personal data fields (`gender`, `city`, `phone`, `birthdate`, `email`) are shown in a dedicated info card and saved via `PUT /api/auth/profile`. `birthdate` is edited as a native `<input type="date">` in both `ProfileEditSheet.tsx` (mobile) and the inline desktop edit form in `Profile.tsx` — keep both in sync, they duplicate the same fields.

### Onboarding (`OnboardingModal.tsx`)

3-step modal shown once per user (tracked via `localStorage` key `onboarding_completed_{userId}`), triggered from `App.tsx` when `needsOnboarding(userId) && hasIncompleteProfile(user)`. Step 2 collects `bio`, `city`, `gender`, `phone`, and `birthdate` — all optional, skippable. `hasIncompleteProfile()` checks all five fields; once a user dismisses or completes onboarding it never reappears for that user, even if fields are later cleared.

### Branding

App name is "El Club de Nice". Primary color is hot pink `#db2777` (`--color-brand-primary`, hover `#be185d`) — the legacy `violet`/`indigo` Tailwind palette tokens in `index.css` are remapped to pink shades rather than removed, so `bg-violet-*`/`bg-indigo-*` classes in older components still render pink, not purple.

### Data patterns

- `API_BASE` is `import.meta.env.VITE_API_URL ?? ""`. When set, the browser calls the Python backend directly (cross-origin). When empty, requests go through the Vite dev proxy (same-origin).
- **Always use trailing slashes** on collection endpoints: `/api/posts/`, `/api/tags/`, `/api/courses/`, `/api/payments/`, `/api/invitations/`, `/api/achievements/`, `/api/payment-methods/`, `/api/currencies/`, `/api/admin/achievements/`. The FastAPI routes are defined with a trailing slash — omitting it causes a 307 redirect, and the browser strips the `Authorization` header on cross-origin redirects.
- Use `useApiFetch()` hook (not bare `apiFetch`) for authenticated requests — it injects the token automatically.
- Posts use cursor-based pagination (cursor = `created_at` of last item).
- `posts_view` is a Supabase SQL view that joins posts with profiles — query it directly instead of joining in code.
- Supabase auth uses the **admin API** server-side so email confirmation is bypassed on register.
- WebSocket URLs derive from `API_BASE`/`VITE_API_URL` with the scheme swapped (`http→ws`, `https→wss`).
