# Auth Test Coverage (Phase 3D)

This phase adds minimal, fast unit tests for auth hardening:

- Role route mapping (`getDashboardPathForRole`)
- Auth schema validation (`loginSchema`, `registerSchema`)
- Public registration role lock (`buildParentRegistrationData`)
- Protected-route redirect decisions (`getDashboardRedirectPath`)
- Demo-login env flag behavior (`parseDemoLoginEnabled`, `isDemoLoginEnabled`)

## Deferred Integration Tests

The following should be added in later phases when workflow actions and richer route logic are implemented:

- Full login flow against seeded demo users and hashed users
- Server redirect behavior from actual protected layouts/pages
- End-to-end registration + login + dashboard redirect
- Ownership isolation tests against Prisma-backed records
- CSRF/session hardening checks for production auth mode
