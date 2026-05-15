# Test Strategy

The current suite uses Node's built-in test runner through `tsx`.

This keeps the TDD loop fast for the logic-heavy parts of the MVP:

- Zod validation schemas
- Role routing helpers
- Status transition helpers
- Access-control helpers
- Workflow service guards
- Pure data-shaping helpers

## Commands

```bash
npm run test
npm run test:watch
npm run test:coverage
```

Run the full verification set before reporting a phase as complete:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Folder Structure

```txt
tests/
  unit/
    access-control/
    auth/
    queries/
    services/
    validations/
  integration/
  components/
```

Use `tests/unit` for fast tests that do not require a real database or browser.

Use `tests/integration` for Prisma-backed workflow tests once a reliable test database is configured.

Use `tests/components` for React component tests once a component test environment such as React Testing Library plus jsdom is added.

## Current Coverage Areas

- Role route mapping through `getDashboardPathForRole`
- Auth schema validation through `loginSchema` and `registerSchema`
- Public registration role lock through `buildParentRegistrationData`
- Protected-route redirect decisions through `getDashboardRedirectPath`
- Demo-login env flag behavior
- Parent and child onboarding validation schemas
- Parent-student ownership behavior through `canAccessStudentWithClient`
- Assessment validation, status transitions, ownership, and notification payload helpers
- Parent/admin assessment outcome data-shaping guards
- Recommended plan acceptance and enrollment status transitions
- Payment submission, review, status transitions, and activation helpers
- Payment and enrollment access-control helpers

## TDD Expectations

Every feature phase should begin by adding or updating tests for the behavior being introduced.

The phase report should include:

- Tests written before implementation
- Initial failing test result
- Implementation summary
- Final passing test result
- Remaining test gaps

Do not delete failing tests to make the suite pass. Fix the behavior or document the missing infrastructure honestly.

## Deferred Test Infrastructure

The following are intentionally deferred until the project needs them:

- React Testing Library and jsdom for component tests
- Prisma-backed integration test database setup
- Browser-level route tests with Playwright
- End-to-end seeded-data workflow tests
