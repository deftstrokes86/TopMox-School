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
- A deployment host that can run a Next.js App Router application, such as
  Vercel or another Node-compatible platform.

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
NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"
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

## Production/Staging Deployment

Use the following deployment sequence for production-like environments:

1. Configure environment variables in the hosting provider.
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

7. Configure Flutterwave URLs:

- Callback URL: `${APP_BASE_URL}/api/payments/flutterwave/callback`
- Webhook URL: `${APP_BASE_URL}/api/webhooks/flutterwave`

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

- Demo login disabled by default with `NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"`.
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
