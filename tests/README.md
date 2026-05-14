# Auth Test Coverage (Phase 3D)

This phase adds minimal, fast unit tests for auth hardening:

- Role route mapping (`getDashboardPathForRole`)
- Auth schema validation (`loginSchema`, `registerSchema`)
- Public registration role lock (`buildParentRegistrationData`)
- Protected-route redirect decisions (`getDashboardRedirectPath`)
- Demo-login env flag behavior (`parseDemoLoginEnabled`, `isDemoLoginEnabled`)
- Parent and child onboarding validation schemas
- Parent-student ownership gate behavior via `canAccessStudentWithClient`

## Deferred Integration Tests

The following should be added in later phases when workflow actions and richer route logic are implemented:

- Full login flow against seeded demo users and hashed users
- Server redirect behavior from actual protected layouts/pages
- End-to-end registration + login + dashboard redirect
- Ownership isolation tests against Prisma-backed records
- Parent profile upsert action integration tests
- Child profile create/update/delete action integration tests
- CSRF/session hardening checks for production auth mode
