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
