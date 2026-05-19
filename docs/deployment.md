# TopMox Deployment Guide

This guide prepares TopMox Global Tutoring for a demo deployment or a
production-like staging deployment. It covers configuration, verification,
database setup, Flutterwave setup, and the common recovery steps for blank
screens or deployment failures.

## Prerequisites

- Node.js 20 LTS or newer.
- npm, using the committed `package-lock.json`.
- PostgreSQL database for Prisma.
- Environment variables copied from `.env.example` and filled with real
  deployment values.
- Flutterwave account configuration if live checkout is enabled.
- Hostinger Node.js hosting configured to run a Next.js App Router application.
- Do not use static export. TopMox depends on NextAuth, Prisma, Supabase
  Postgres, Flutterwave API routes, middleware, server actions, and protected
  routes.

## Required Environment Variables

Set these in local `.env.local`, staging, and production as appropriate:

```bash
DATABASE_URL=""
AUTH_SECRET=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""
APP_BASE_URL=""

FLUTTERWAVE_PUBLIC_KEY=""
FLUTTERWAVE_SECRET_KEY=""
FLUTTERWAVE_SECRET_HASH=""
FLUTTERWAVE_BASE_URL="https://api.flutterwave.com/v3"

NEXT_PUBLIC_FLUTTERWAVE_ENABLED="true"
NEXT_PUBLIC_MANUAL_PAYMENTS_ENABLED="true"
DEMO_LOGIN_ENABLED="false"
NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"
DEMO_USER_PASSWORD=""
```

Keep `AUTH_SECRET` and `NEXTAUTH_SECRET` aligned unless the auth strategy is
changed. Do not commit real secrets. Keep demo login disabled in production-like
environments unless a private staged walkthrough intentionally enables it.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill the local database and auth
   values:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. Apply local migrations:

```bash
npm run prisma:migrate
```

5. Seed demo data when preparing a local or staged walkthrough:

```bash
npm run prisma:seed
```

6. Start the development server:

```bash
npm run dev
```

Use a clean development server if stale `.next` artifacts are suspected:

```bash
npm run dev:clean
```

## Verification

Run the full verification ladder before a demo handoff, staging deployment, or
production deployment:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run verify:site
npm run verify:browser
```

`npm run verify:site` expects a running app at `http://localhost:7000` unless
`VERIFY_URL` is set. `npm run verify:browser` starts its own clean browser smoke
server.

## Hostinger Production/Staging Deployment

Use the following deployment sequence for Hostinger production-like environments:

1. Configure environment variables in Hostinger hPanel.
2. Generate Prisma Client during install/build:

```bash
npm run prisma:generate
```

3. Apply production migrations:

```bash
npx prisma migrate deploy
```

4. Decide seed strategy:

- For a client demo or staging walkthrough, run `npm run prisma:seed` with
  demo-only credentials and demo login intentionally configured.
- For production, seed only required operational records such as subjects,
  plans, and approved resources. Do not seed demo users unless explicitly
  running a private demo environment.

5. Build the application:

```bash
npm run build
```

6. Start the deployed server:

```bash
npm run start
```

If Hostinger requires an explicit port, set `PORT` in hPanel or use the
Hostinger-provided Node.js startup configuration.

Do not use static export. The app must run as a Next.js Node.js application.

7. Configure Flutterwave URLs with the Hostinger domain:

- Callback URL: `https://YOUR_DOMAIN/api/payments/flutterwave/callback`
- Webhook URL: `https://YOUR_DOMAIN/api/webhooks/flutterwave`

8. Run smoke checks against the deployed base URL:

```bash
VERIFY_URL="https://your-domain.example" npm run verify:site
PLAYWRIGHT_BASE_URL="https://your-domain.example" npm run verify:browser
```

On PowerShell:

```powershell
$env:VERIFY_URL="https://your-domain.example"; npm run verify:site
$env:PLAYWRIGHT_BASE_URL="https://your-domain.example"; npm run verify:browser
```

## Hostinger Geolocation Strategy

Hostinger does not provide platform geo headers by default. TopMox uses
Hostinger-compatible country guidance with a visible country selector.

Priority order:

1. Manual selected region cookie: `topmox_region`.
2. Cloudflare country header if the domain is proxied through Cloudflare:
   `CF-IPCountry`.
3. Optional custom proxy headers if Hostinger/CDN configuration later supports
   them: `x-country-code`, `x-forwarded-country`, or `x-geo-country`.
4. Weak browser hints such as timezone and `Accept-Language`.
5. Nigeria fallback with NGN.

Manual selection always wins. Header detection is only a guess. The country
selector works even without Cloudflare, and users should never be trapped in the
wrong country experience. The homepage changes its guidance by resolved region,
but the safe final fallback is Nigeria/NGN when no reliable signal is available.

Region-based pricing context is guidance for parents. Payment amount and
currency must still be derived server-side from enrollment/plan data. Manual
payment fallback remains available. For AUD and AED, live online checkout should
be confirmed in the TopMox payment account before enabling gateway collection.

The homepage is region-aware and should default to Nigeria/NGN when no reliable
signal is available. Global tutoring, Locations, Resources, and FAQ are grouped
under About in the main public navigation. FAQ remains available at `/faq`.

## Flutterwave Notes

- Configure `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, and
  `FLUTTERWAVE_SECRET_HASH` from the Flutterwave dashboard.
- Keep `FLUTTERWAVE_SECRET_KEY` and `FLUTTERWAVE_SECRET_HASH` server-only.
- Set `FLUTTERWAVE_BASE_URL` to `https://api.flutterwave.com/v3` unless
  Flutterwave instructs otherwise.
- Configure the webhook endpoint as
  `${APP_BASE_URL}/api/webhooks/flutterwave`.
- Configure the callback URL as
  `${APP_BASE_URL}/api/payments/flutterwave/callback`.
- Test checkout with currencies enabled on the Flutterwave merchant account.
- Payment methods can vary by country, currency, KYC state, and account setup.
- Never activate enrollment from callback query status or raw webhook payload
  alone.
- Always verify amount, currency, reference, transaction status, ownership, and
  enrollment link server-side before activation.
- Duplicate callbacks or webhooks must remain idempotent.
- Manual transfer remains available as fallback and activates enrollment only
  after admin approval.

## Production Safety Checklist

- Demo login is disabled by default with `DEMO_LOGIN_ENABLED="false"` and `NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"`.
- Use demo login only for private staging/client demos. Demo buttons render only when public visibility, server enforcement, seeded accounts, and database readiness pass. `DEMO_LOGIN_ENABLED` is the server-side source of truth.
- Before enabling demo login, run `npm run prisma:seed` so the fixed demo accounts are present with hashed passwords and required profiles. Use `DEMO_USER_PASSWORD` in private environment configuration if the default local/demo fallback should be replaced.
- If `/api/health` does not report `status: ok` and `database: connected`, do not claim demo login is verified.
- Error boundaries show safe branded messages and do not expose stack traces in
  production UI.
- No real secrets committed.
- No fake bank details displayed.
- Public pages render safely if the database is degraded where fallback content
  exists.
- Flutterwave checkout can be disabled by setting
  `NEXT_PUBLIC_FLUTTERWAVE_ENABLED="false"` while keeping manual payments
  available where operationally appropriate.
- Role access is enforced server-side for Admin, Parent, and Tutor routes.

## Troubleshooting

### Blank Screen

Run:

```bash
npm run clean:next
npm run dev:clean
npm run verify:browser
```

Check the dev terminal and browser smoke output for hydration errors,
`ChunkLoadError`, missing `/_next/static` assets, manifest parse errors, and
uncaught page errors.

### Stale `.next`

Clear generated artifacts:

```bash
npm run clean:next
```

Restart the server after cleanup.

### Database Unavailable

Symptoms include Prisma `P1001` or `/api/health` returning `degraded`.

Check:

- PostgreSQL service is running.
- `DATABASE_URL` points to the correct host, port, database, and schema.
- Network/firewall access is allowed from the deployment host.
- Migrations have been applied with `npx prisma migrate deploy`.

### Auth Secret Missing

If auth crashes or sessions fail:

- Set `AUTH_SECRET`.
- Set `NEXTAUTH_SECRET` to the same value unless the auth configuration changes.
- Set `NEXTAUTH_URL` to the deployed domain.

### Flutterwave Not Configured

If Flutterwave checkout is unavailable:

- Confirm `NEXT_PUBLIC_FLUTTERWAVE_ENABLED`.
- Confirm all Flutterwave keys are set.
- Confirm `APP_BASE_URL` is correct.
- Keep manual transfer enabled only if TopMox operations are ready to verify
  manual payments.

### Failed Webhook Verification

Check:

- `FLUTTERWAVE_SECRET_HASH` matches the Flutterwave dashboard value.
- The request reaches `/api/webhooks/flutterwave`.
- The transaction is verified server-side before activation.
- Amount, currency, provider reference, payment ownership, and enrollment link
  match the local payment record.

### Hydration Errors

Run:

```bash
npm run verify:browser
```

Fix the route reported by Playwright before continuing feature work. Do not
silence unknown console errors.
