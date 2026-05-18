# task-list.md

# TopMox Global Tutoring Task List

## Build Strategy

We are starting from a clean project.

The build should follow this sequence:

1. Foundation.
2. Database and auth.
3. Public marketing pages.
4. Parent onboarding.
5. Assessment system.
6. Plan recommendation and enrollment.
7. Payments.
8. Tutor assignment and lessons.
9. Progress reports.
10. Dashboards.
11. Support and communication logs.
12. Resources.
13. Testing and polish.

Do not jump randomly between features.  
Complete each layer before moving to the next.

---

## TDD Build Rule

Every implementation phase must begin with tests for the expected behavior before feature code is written.

Each phase report must include:

- Tests written before implementation.
- Initial failing test result.
- Implementation summary.
- Final passing test result.
- Any test gaps.

Do not remove failing tests just to make the build pass. If test infrastructure is missing, create the missing test foundation before continuing feature work.

---

## Payment Build Rule

Payment work must follow strict TDD and must protect enrollment activation.

- Flutterwave is the primary live payment gateway.
- Manual transfer remains available as fallback.
- Stripe is not part of the active payment stack.
- Support NGN, USD, GBP, EUR, and CAD where available.
- Do not assume Flutterwave methods are Nigeria-only or universally available.
- Never trust callback status alone.
- Verify webhooks before processing.
- Check amount, currency, provider reference, transaction id, ownership, and enrollment state before activation.
- Treat duplicate payment events idempotently.
- Activate enrollment only after verified successful Flutterwave payment or admin-approved manual payment.

---

## Hostinger Location/Currency Rule

TopMox deploys as a Next.js Node.js app on Hostinger, not as a static export.

Location personalization must be soft and Hostinger-compatible:

- Manual `topmox_region` cookie always wins.
- Optional Cloudflare `CF-IPCountry` can provide a soft default.
- Optional custom country headers may be used later.
- Browser timezone and `Accept-Language` are weak fallbacks.
- Unknown geo data falls back to Nigeria/NGN.
- Never hard redirect by guessed location.
- Public currency display must not control payment amount or currency.
- Payment amount and currency are derived server-side.
- Manual payment fallback remains available.

---

## Phase 0: Project Setup

### Tasks

- [ ] Create new Next.js App Router project.
- [ ] Add TypeScript.
- [ ] Add Tailwind CSS.
- [ ] Add shadcn/ui.
- [ ] Add Framer Motion.
- [ ] Add Lucide React.
- [ ] Add Prisma.
- [ ] Add PostgreSQL connection.
- [ ] Add Zod.
- [ ] Add React Hook Form.
- [ ] Configure linting.
- [ ] Configure formatting.
- [ ] Create base folder structure.

### Folder Structure

```txt
src/
  app/
  components/
    marketing/
    dashboard/
    forms/
    reports/
    shared/
  lib/
    auth/
    validations/
    constants/
    utils/
    demo-data/
  server/
    actions/
    queries/
  styles/
prisma/
  schema.prisma
docs/
  prd.md
  design.md
  task-list.md
```
