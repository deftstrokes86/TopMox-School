# Test Coverage

The current suite uses minimal, fast unit tests for auth hardening,
onboarding, and the assessment workflow foundation:

- Role route mapping (`getDashboardPathForRole`)
- Auth schema validation (`loginSchema`, `registerSchema`)
- Public registration role lock (`buildParentRegistrationData`)
- Protected-route redirect decisions (`getDashboardRedirectPath`)
- Demo-login env flag behavior (`parseDemoLoginEnabled`, `isDemoLoginEnabled`)
- Parent and child onboarding validation schemas
- Parent-student ownership gate behavior via `canAccessStudentWithClient`
- Assessment request, schedule, and outcome validation schemas
- Assessment status transition helpers for scheduling, completion, recommendation, and decline paths
- Assessment ownership checks via `canAccessAssessmentWithClient`
- Assessment notification payload helpers for submitted, scheduled, and plan-recommended events
- Parent/admin assessment outcome data-shaping guards for internal admin notes
- Recommended plan acceptance validation and enrollment status transitions
- Enrollment ownership gates via `canAccessEnrollmentWithClient`

## Deferred Integration Tests

The following should be added in later phases when workflow actions and richer route logic are implemented:

- Full login flow against seeded demo users and hashed users
- Server redirect behavior from actual protected layouts/pages
- End-to-end registration + login + dashboard redirect
- Ownership isolation tests against Prisma-backed records
- Parent profile upsert action integration tests
- Child profile create/update/delete action integration tests
- Prisma-backed assessment request submission with notification creation
- Prisma-backed admin scheduling, completion, and outcome recording
- Prisma-backed recommended plan acceptance and enrollment creation
- Browser-level route access tests for parent, admin, and tutor assessment pages
- End-to-end assessment-to-recommendation flow against seeded demo data
- CSRF/session hardening checks for production auth mode
