# TopMox Stability Guide

This guide exists because a blank white page is never an acceptable failure
mode for TopMox Global Tutoring. The app should either render the route or show a
safe error state.

## Current Blank-Screen Findings

The latest investigation found these stability risks:

- Route smoke coverage was too shallow. It checked the homepage, public pages,
  and login, but not registration, password recovery, dashboard redirects, or
  app health.
- The App Router had a root route error boundary, but no `global-error.tsx`,
  `not-found.tsx`, or root loading fallback.
- Dashboard route groups did not have local error/loading fallbacks, so a
  dashboard data or layout failure could produce a poor runtime experience.
- The health route depended directly on a database probe response and could
  report the app as failed when the app shell itself was still alive.
- Earlier incidents also showed stale `.next` generated artifacts, including
  missing compiled chunks and manifest parse failures.

## Error Boundary Structure

The stability layer now includes:

- `src/app/error.tsx` for route-level runtime errors.
- `src/app/global-error.tsx` for root/app-shell failures.
- `src/app/not-found.tsx` for unknown routes.
- `src/app/loading.tsx` for root loading fallback.
- Route group error/loading fallbacks for `(public)`, `(auth)`, `admin`,
  `parent`, and `tutor`.
- `src/components/shared/ErrorBoundary.tsx` for client-side render failures.

Error UI follows the TopMox design system, avoids exposing stack traces in
production, and shows development-only error messages for debugging.

## Smoke Checks

Run the route smoke checker after starting the app:

```bash
npm run verify:site
```

It checks:

- Public marketing routes.
- Auth routes.
- Dashboard entry routes.
- `/api/health`.
- `/api/geo`.
- Homepage static assets under `/_next/static`.

Dashboard routes may redirect unauthenticated users to `/login`. That is safe
as long as the redirect produces real HTML instead of a blank page or crash.

Location routes such as `/locations`, `/locations/nigeria`,
`/locations/united-states`, `/locations/canada`, `/locations/australia`,
`/locations/united-kingdom`, `/locations/europe`, and `/locations/uae` are part
of the public smoke path. They should render even when no geo headers are
available.

## Browser Smoke Checks

Run the browser smoke suite with:

```bash
npm run verify:browser
```

If Playwright browser binaries are missing on a fresh machine, install Chromium
first:

```bash
npx playwright install chromium
```

The browser smoke suite starts a clean dev server on `http://localhost:7000`
and checks these routes in Chromium:

- Public: `/`, `/global-tutoring`, `/subjects`, `/subjects/mathematics`,
  `/subjects/english`, `/subjects/science`, `/subjects/reading-comprehension`,
  `/exam-prep`, `/pricing`, `/about`, `/faq`, `/contact`, `/locations`,
  `/locations/nigeria`, `/locations/united-states`, `/locations/canada`,
  `/locations/australia`, `/locations/united-kingdom`, `/locations/europe`,
  `/locations/uae`, `/resources`, and a published resource detail route.
- Auth: `/login`, `/register`, `/forgot-password`.
- Protected admin routes: `/admin`, `/admin/assessments`, `/admin/payments`,
  `/admin/enrollments`, `/admin/lessons`, `/admin/homework`, `/admin/reports`,
  `/admin/support`, `/admin/resources`, `/admin/notifications`.
- Protected parent routes: `/parent`, `/parent/onboarding`, `/parent/children`,
  `/parent/assessments`, `/parent/enrollments`, `/parent/payments`,
  `/parent/lessons`, `/parent/homework`, `/parent/reports`, `/parent/support`,
  `/parent/notifications`.
- Protected tutor routes: `/tutor`, `/tutor/lessons`, `/tutor/homework`,
  `/tutor/reports`, `/tutor/notifications`.
- Health: `/api/health`.
- Geo debug: `/api/geo`.

Protected routes may redirect to `/login` when unauthenticated. That is valid
as long as the browser renders meaningful text and does not blank.

The browser suite also includes a small mobile viewport pass for representative
public, auth, and protected routes. These checks catch page-level horizontal
overflow, permanent loading states, and fatal browser errors before a phase is
reported complete.

## Hostinger Geo Stability

TopMox is deployed as a Next.js Node.js app on Hostinger, not as a static
export. Location personalization must not depend on platform-specific hosting
headers.

Safe geo priority:

1. Manual `topmox_region` cookie.
2. Cloudflare `CF-IPCountry` if the domain is proxied through Cloudflare.
3. Optional custom headers: `x-country-code`, `x-forwarded-country`,
   `x-geo-country`.
4. Weak browser hints such as timezone and `Accept-Language`.
5. Nigeria/NGN fallback.

No page should blank if region detection is missing, invalid, or ambiguous. The
country switcher lets users choose the experience that fits their family, and
the safe default is Nigeria with NGN.
The homepage should render region-aware copy for the resolved region without
depending on Vercel headers. Global tutoring, Locations, Resources, and FAQ are
grouped under About in the main public navigation; `/faq` remains directly
accessible.

The browser suite fails on serious client-side issues, including:

- Uncaught page errors.
- Hydration failures.
- Minified React errors.
- `ChunkLoadError`.
- Missing Next.js compiled chunks.
- Manifest JSON parse failures.
- `TypeError` or `ReferenceError` crashes.
- `Cannot read properties of undefined/null`.
- `/_next/static` 404 or 500 responses.
- Visible mojibake or replacement glyphs such as `Â` or `�`.

It also fails if the body has no meaningful visible text, stays on the loading
fallback, or renders only the generic error boundary for routes that should load
normally.

## `verify:site` vs `verify:browser`

Use both checks because they catch different failures:

- `npm run verify:site` is a Node HTTP smoke test. It verifies server responses,
  redirects, route HTML, health JSON, and static asset URLs.
- `npm run verify:browser` is a Playwright Chromium smoke test. It catches
  hydration failures, browser console errors, uncaught client errors, and real
  blank-screen behavior.

## Blank Page Recovery

If a browser shows a blank page after the dev server starts:

```bash
npm run clean:next
npm run dev:clean
```

Then hard refresh the browser at:

```txt
http://localhost:7000
```

This clears stale Next.js generated artifacts from `.next` and
`node_modules/.cache`.

## Log Checks

Check the dev terminal for:

- Missing `.next` chunks such as `Cannot find module './276.js'`.
- `/_next/static` 404s.
- Manifest JSON parse errors.
- Hydration errors.
- NextAuth missing secret or URL warnings.
- Prisma generated-client errors.

If those appear, stop the dev server, clean the Next cache, and restart.

If the blank screen returns after cache cleanup, run:

```bash
npm run verify:site
npm run verify:browser
```

Use the failing route and any browser console error reported by Playwright as
the starting point for the fix. Do not continue feature work until the route
renders or shows a useful error state.

## Health Check

Use:

```txt
http://localhost:7000/api/health
```

Expected shape:

```json
{
  "status": "ok",
  "app": "TopMox Global Tutoring",
  "timestamp": "2026-05-16T00:00:00.000Z",
  "database": "connected"
}
```

If the database is unavailable, the endpoint should return `status:
"degraded"` and `database: "disconnected"` instead of crashing.

## Required Verification

Before calling a stability fix complete, run:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run verify:site
npm run verify:browser
```

`npm run verify:site` expects the app to already be running. Start it first:

```bash
npm run dev:clean
```

At minimum, manually check:

- `/`
- `/login`
- `/admin`
- `/parent`
- `/tutor`

Protected dashboard routes should redirect safely to `/login` when the user is
not authenticated.

## Demo login stability

Demo login is a private staging/client-demo feature, not normal production authentication.

- `NEXT_PUBLIC_DEMO_LOGIN_ENABLED` only allows Demo access buttons to be considered for rendering.
- `DEMO_LOGIN_ENABLED` is the server-side enforcement flag and source of truth.
- Login renders Demo access only when public visibility, server enforcement, seeded accounts, and database readiness pass.
- Demo login authorizes only fixed seeded accounts: `admin@topmox.test`, `parent@topmox.test`, and `tutor@topmox.test`.
- Demo users must be created by `npm run prisma:seed`, must have scrypt password hashes, and parent/tutor demo users must have the expected profiles.
- `DEMO_USER_PASSWORD` can be set before seeding in private demo environments. If it is blank locally, the seed script uses the demo-only fallback `TopMoxDemo2026!`.
- If Supabase is disconnected or `/api/health` is degraded, demo login is not verified.
- If public visibility is enabled but server enforcement is disabled, demo buttons must stay hidden and direct readiness checks must fail safely without exposing credentials.
