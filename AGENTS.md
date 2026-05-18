# TopMox Agent Instructions

This repository is the TopMox Global Tutoring Next.js application.

## TDD Build Rule

Every new feature phase must follow test-driven development:

1. Write or update tests first.
2. Run tests and confirm the new tests fail for the expected reason.
3. Implement the smallest feature code required.
4. Run tests and confirm they pass.
5. Run lint, typecheck, and build.
6. Report failing tests honestly.

Do not claim TDD was followed unless tests were written before implementation.

Do not remove failing tests to make the build pass.

If a test cannot be written because infrastructure is missing, state exactly why and create the missing test infrastructure first.

## Required Verification

Before reporting a feature phase as complete, run:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run verify:site
npm run verify:browser
```

Run `npm run verify:site` and `npm run verify:browser` when those scripts are available in `package.json`.

If any command cannot run because of environment configuration, browser binaries, a missing dev server, or an external dependency, report the exact reason honestly.

## Current Test Setup

The current suite uses Node's built-in test runner through `tsx`.

Use the existing `tests/unit` structure for fast schema, service, status-transition, and access-control tests.

Add integration tests under `tests/integration` only when the workflow requires database-backed behavior.

## Payment Rules

All payment work must use TDD.

Flutterwave is the primary live gateway. Manual transfer remains as fallback. Do not introduce Stripe.

Do not activate an enrollment from callback data alone. Flutterwave payments must be verified, webhooks must be checked, and amount, currency, transaction reference, payment ownership, and enrollment ownership must match before activation.

Manual payments can only activate enrollment through admin approval.

Payment event processing must be idempotent so duplicate callbacks or webhooks do not create duplicate state transitions.

## Hostinger Geo and Currency Rules

TopMox is deployed as a Next.js Node.js app on Hostinger, not as a static export.

Do not depend on platform-specific geo headers. Region personalization must use:

1. Manual `topmox_region` cookie.
2. Optional Cloudflare `CF-IPCountry`.
3. Optional custom country headers: `x-country-code`, `x-forwarded-country`, `x-geo-country`.
4. Weak browser hints such as timezone and `Accept-Language`.
5. Nigeria/NGN fallback.

User-selected country always wins. Never trap users in a guessed country experience.

Public pricing context is not payment authority. Payment amount and currency must be derived server-side from enrollment/plan data. Manual payment fallback remains available, and online checkout can be disabled for currencies that require account confirmation. Global tutoring, Locations, Resources, and FAQ should be grouped under About in the main public navigation, while `/faq` remains accessible.

## Demo Login Rules

Demo login is for private staging/client demos only, not normal production use.

Use both flags:

```bash
DEMO_LOGIN_ENABLED="false"
NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"
DEMO_USER_PASSWORD=""
```

`NEXT_PUBLIC_DEMO_LOGIN_ENABLED` controls whether demo buttons render. `DEMO_LOGIN_ENABLED` is the server-side source of truth and must reject demo login when false.

Demo login must only authorize fixed seeded accounts for Admin, Parent, and Tutor. Do not allow arbitrary role or email selection, do not expose password hashes or raw demo credentials to the client, and do not bypass server-side auth/RBAC.

Before claiming demo login works, run `npm run prisma:seed`, confirm `/api/health` returns `status: ok` and `database: connected`, and browser-test the Admin, Parent, and Tutor demo buttons.
