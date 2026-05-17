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
- Homepage static assets under `/_next/static`.

Dashboard routes may redirect unauthenticated users to `/login`. That is safe
as long as the redirect produces real HTML instead of a blank page or crash.

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
```

Then start the app and run:

```bash
npm run dev:clean
npm run verify:site
```

At minimum, manually check:

- `/`
- `/login`
- `/admin`
- `/parent`
- `/tutor`

Protected dashboard routes should redirect safely to `/login` when the user is
not authenticated.
