# TopMox Client Demo Walkthrough

## Demo Positioning

TopMox already has the school. This platform turns that school credibility into an international tutoring business.

The demo should feel like a tutoring business operating system, not only a website. The story is that TopMox can attract parents, capture assessment requests, recommend structured plans, collect and verify payment, assign tutors, schedule lessons, track homework, publish progress reports, manage support, and monitor operations from one role-safe platform.

## Demo Objective

This walkthrough shows how TopMox can:

- Attract parents through a credible public website.
- Capture assessment requests with useful academic context.
- Recommend plans based on assessment details.
- Collect and verify payment through Flutterwave or manual fallback.
- Assign tutors and schedule lessons after activation.
- Track homework, lesson notes, and parent-visible progress.
- Publish progress reports that support retention.
- Manage support requests and internal communication logs.
- Monitor operations through Admin, Parent, and Tutor dashboards.

## Demo Accounts

Use these only for local or private staged walkthroughs. Demo login is controlled by two flags:

- `NEXT_PUBLIC_DEMO_LOGIN_ENABLED` controls whether the buttons render.
- `DEMO_LOGIN_ENABLED` is the server-side enforcement flag and source of truth.

Keep both flags disabled in production. If the public flag is enabled but the server flag is disabled, the buttons fail safely with: "Demo login is currently unavailable. Please check demo configuration and seeded accounts."

Seed demo passwords with `DEMO_USER_PASSWORD`. If that variable is blank during local/demo seeding, the seed script uses the demo-only fallback `TopMoxDemo2026!`. Do not put real credentials in docs or client code.

| Role | Email | Walkthrough use |
| --- | --- | --- |
| Admin | `admin@topmox.test` | Operations dashboard, assessments, payments, lessons, reports, support, resources |
| Tutor | `amara.math@topmox.test` | Mathematics and Science lessons, homework, reports |
| Parent | `ngozi.parent@topmox.test` | Nigeria parent with active plan, lessons, homework, report, support |

Additional seeded walkthrough accounts can remain in the database for story coverage, but the visible demo-login buttons are deterministic: Continue as Admin, Continue as Parent, and Continue as Tutor.

## Demo Order

1. Homepage.
2. Global tutoring page.
3. Pricing page.
4. Parent login.
5. Parent dashboard.
6. Child profile.
7. Assessment request.
8. Assessment recommendation.
9. Plan acceptance/enrollment.
10. Payment status.
11. Admin login.
12. Admin dashboard.
13. Admin assessment management.
14. Admin payment review.
15. Admin tutor assignment and lesson scheduling.
16. Tutor login.
17. Tutor lesson view.
18. Tutor lesson completion/homework.
19. Parent lesson notes/homework.
20. Progress report.
21. Support request.
22. Notifications/activity.
23. Resources.
24. Final admin dashboard view.

## Talking Points

### 1. Homepage

What to show: Public homepage, primary positioning, and assessment CTA.

What to say: TopMox is already trusted as a school. This site turns that trust into a clear online tutoring offer.

Why it matters to TopMox: Parents need to understand the offer quickly before they commit to an assessment.

What business value it proves: The platform can attract parent demand instead of relying only on manual referrals.

### 2. Global tutoring page

What to show: Global tutoring positioning for Nigeria and diaspora parents.

What to say: TopMox can support families in Nigeria, the UK, Canada, and other locations through structured online lessons.

Why it matters to TopMox: It expands the school brand beyond the physical campus.

What business value it proves: The same education credibility can support an international tutoring service.

### 3. Pricing page

What to show: Plan positioning and assessment-first pathway.

What to say: Pricing is structured around support intensity, but the recommendation still begins with understanding the child.

Why it matters to TopMox: Parents need a clear buying path without feeling pushed into the wrong plan.

What business value it proves: The platform can convert interest into plan selection while preserving trust.

### Optional: Locations and region switcher

What to show: the location-aware homepage, `/locations`, one region page such as `/locations/nigeria` or `/locations/united-kingdom`, the public header region switcher, and the pricing currency note.

What to say: TopMox can speak to families in Nigeria, the US, Canada, Australia, the UK, Europe, and the UAE with a country-aware homepage and location pages. Parents can choose their country from the selector, and if no signal is available, the safe default is Nigeria/NGN.

Why it matters to TopMox: Hostinger does not provide automatic country headers by default, so this strategy works with Hostinger and can optionally use Cloudflare `CF-IPCountry`.

What business value it proves: TopMox can market internationally while keeping payment currency and checkout safety server-controlled.

### 4. Parent login

What to show: Login page and optional demo quick login if enabled.

What to say: Demo login is for staged walkthroughs only and is controlled by environment configuration.

How to enable for staging/demo:

- Run `npm run prisma:seed` so `admin@topmox.test`, `ngozi.parent@topmox.test`, and `amara.math@topmox.test` exist with hashed passwords and required profiles.
- Set `DEMO_LOGIN_ENABLED="true"`.
- Set `NEXT_PUBLIC_DEMO_LOGIN_ENABLED="true"`.
- Optionally set `DEMO_USER_PASSWORD` before seeding. Leave it blank only for local/demo fallback.
- Confirm `/api/health` reports `status: ok` and `database: connected`.

How to disable for production:

- Set `DEMO_LOGIN_ENABLED="false"`.
- Set `NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"`.
- Confirm the login page does not render Demo access buttons.

If demo buttons do not appear, check `NEXT_PUBLIC_DEMO_LOGIN_ENABLED`. If buttons appear but fail, check `DEMO_LOGIN_ENABLED`, the seed data, and Supabase connectivity. A disconnected Supabase database can show P1001-style failures and must be fixed before claiming demo login works.

Why it matters to TopMox: Role-based access keeps parent, tutor, and admin experiences separate.

What business value it proves: The platform is ready for real user roles, not just static pages.

### 5. Parent dashboard

What to show: Parent dashboard for `ngozi.parent@topmox.test`.

What to say: The parent sees the next action, active plan, lessons, homework, report, support, and notifications in one place.

Why it matters to TopMox: Parents should not have to chase staff to know what is happening.

What business value it proves: Visibility supports retention and parent confidence.

### 6. Child profile

What to show: Child profile information and academic context.

What to say: The system captures curriculum, class/year group, subjects, challenges, goals, and preferred lesson times.

Why it matters to TopMox: Better context helps TopMox recommend and assign support more responsibly.

What business value it proves: The platform turns scattered parent messages into structured operational data.

### 7. Assessment request

What to show: Book assessment flow or parent assessment list. This is the Book assessment flow checkpoint.

What to say: Assessment requests capture the child's needs before a plan is recommended.

Why it matters to TopMox: Assessment-first selling is more trustworthy than generic package pushing.

What business value it proves: TopMox can capture qualified leads and move them into an admin review queue.

### 8. Assessment recommendation

What to show: Parent assessment recommendation and plan card.

What to say: The recommendation gives parents clarity, reduces guesswork, and maps the next step.

Why it matters to TopMox: It creates a clear conversion moment after the assessment.

What business value it proves: The platform supports assessment-to-plan conversion.

### 9. Plan acceptance/enrollment

What to show: Recommended plan acceptance and enrollment status.

What to say: Accepting the plan creates an enrollment, but does not activate tutoring until payment is verified.

Why it matters to TopMox: It prevents operational confusion and unsafe activation.

What business value it proves: TopMox can manage plan conversion without skipping payment control.

### 10. Payment status

What to show: Parent payments page with awaiting verification, paid, and Flutterwave pending examples.

What to say: Flutterwave is the primary live gateway, and manual transfer remains a fallback. No fake bank details are shown.

Why it matters to TopMox: Payment workflows must be clear and safe across currencies and locations.

What business value it proves: The platform can track revenue steps while protecting activation rules.

### 11. Admin login

What to show: Admin login using `admin@topmox.test`.

What to say: Admins have their own operational dashboard and cannot be confused with parent or tutor views.

Why it matters to TopMox: Operations need full visibility without leaking admin tools to other roles.

What business value it proves: Role-based operations are demo-ready.

### 12. Admin dashboard

What to show: Admin stat cards, operational queues, activity, and quick actions.

What to say: This is the cockpit for the tutoring business.

Why it matters to TopMox: Admin can see assessments, payments, active enrollments, lessons, support, reports, and resources.

What business value it proves: Leadership can monitor the business without manual spreadsheets.

### 13. Admin assessment management

What to show: Admin assessments list and detail pages.

What to say: Admin can review pending requests, schedule assessments, complete assessments, record outcomes, and recommend plans.

Why it matters to TopMox: Assessment operations become trackable instead of informal.

What business value it proves: The platform supports the full lead-to-recommendation workflow.

### 14. Admin payment review

What to show: Manual payment awaiting verification and paid payment records.

What to say: Manual payments require admin review. Flutterwave payments require server-side verification, not callback status alone.

Why it matters to TopMox: Payment verification protects revenue and prevents accidental activation.

What business value it proves: The system is safer than ad hoc bank-transfer tracking.

### 15. Admin tutor assignment and lesson scheduling

What to show: Active enrollment detail, assigned tutor, and lesson scheduling.

What to say: Tutor assignment and lessons become available after enrollment activation.

Why it matters to TopMox: Staff can move from paid plan to actual tutoring delivery.

What business value it proves: The platform bridges sales and academic operations.

### 16. Tutor login

What to show: Tutor dashboard for `amara.math@topmox.test`.

What to say: Tutors see only assigned work and do not see payment or admin-only data.

Why it matters to TopMox: Tutors need a focused workflow, not an admin console.

What business value it proves: The platform supports safe operational delegation.

### 17. Tutor lesson view

What to show: Assigned upcoming and completed lessons.

What to say: Tutors see student context, subject, time, timezone, status, and meeting link.

Why it matters to TopMox: Tutors can prepare without relying on WhatsApp threads.

What business value it proves: Lesson delivery is organized and auditable.

### 18. Tutor lesson completion/homework

What to show: Tutor lesson delivery/homework panel with notes, attendance, concern flag, and homework.

What to say: Tutors can record what happened and assign practice work after a lesson.

Why it matters to TopMox: Parent trust depends on visible delivery, not only scheduled calls.

What business value it proves: Tutor accountability is built into the workflow.

### 19. Parent lesson notes/homework

What to show: Parent lesson detail and homework page.

What to say: Parents can see completed notes and assigned homework without seeing internal admin-only concern details.

Why it matters to TopMox: Parents get reassurance and evidence of learning support.

What business value it proves: Lesson visibility helps retain families.

### 20. Progress report

What to show: Published parent report and admin/tutor report workflow.

What to say: Progress reports summarize attendance, strengths, areas needing improvement, homework, tutor comments, next steps, and parent action points.

Why it matters to TopMox: Reports create a monthly retention touchpoint.

What business value it proves: TopMox can demonstrate ongoing value without exaggerated promises.

### 21. Support request

What to show: Parent support request and admin support detail.

What to say: Parents can raise issues, and admins can reply and track status.

Why it matters to TopMox: Support becomes accountable instead of scattered across channels.

What business value it proves: Operational follow-up is structured.

### 22. Notifications/activity

What to show: Notification center and activity feed. This is the Notifications/activity checkpoint.

What to say: In-app updates help each role understand what happened recently.

Why it matters to TopMox: Everyone sees relevant updates without cross-role leakage.

What business value it proves: The platform supports daily operating rhythm.

### 23. Resources

What to show: Public resources and admin resources list with published, draft, and archived examples.

What to say: Resources help parents understand tutoring and give TopMox SEO-friendly educational content.

Why it matters to TopMox: Helpful content can support trust and lead generation.

What business value it proves: TopMox can publish educational content without exposing drafts publicly.

### 24. Final admin dashboard view

What to show: Return to Admin dashboard after walking through the full story.

What to say: This closes the loop from public interest to payment, lesson delivery, homework, reports, support, and operations.

Why it matters to TopMox: The demo proves the platform is more than a brochure website.

What business value it proves: TopMox can run a structured online tutoring business from the platform.

## Demo Data Checklist

- Parent in Nigeria with active enrollment, paid payment, scheduled/completed lessons, homework, published report, support request, and notifications.
- Parent in United Kingdom with active English support, pending payment add-on, scheduled assessment, homework, draft report, and payment follow-up.
- Parent in Canada with exam-prep history, Flutterwave pending/failed payment examples, paused enrollment history, and report in review.
- Mathematics/Science tutor with assigned lessons, completed lesson notes, homework, and reports.
- English/Reading tutor with assigned lessons, homework, and report work.
- Admin queues include pending assessments, scheduled/completed assessments, payments, active enrollments, lessons, reports, support requests, communication logs, published resources, draft resources, and archived resources.

## Troubleshooting

Reset seed data:

```bash
npm run prisma:seed
```

Run a clean dev server:

```bash
npm run dev:clean
```

Run browser smoke:

```bash
npm run verify:browser
```

Run authenticated RBAC browser verification:

```powershell
$env:RUN_AUTH_E2E='1'
npm run verify:browser -- tests/e2e/authenticated-rbac.spec.ts
```

Recover from stale `.next` artifacts:

```bash
npm run clean:next
npm run dev:clean
```

Run the full verification ladder before a client demo:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run verify:site
npm run verify:browser
```

Check app health before a demo:

```txt
http://localhost:7000/api/health
```

Check safe geo detection before a demo:

```txt
http://localhost:7000/api/geo
```

If the Hostinger domain is behind Cloudflare, confirm Cloudflare IP geolocation
is enabled so `CF-IPCountry` can provide a soft default. The region switcher
works without Cloudflare because manual selection is stored in `topmox_region`.

If Supabase returns `P1001`, check `/api/health`. A degraded health response is honest and acceptable only if pages still render safely. For a live demo, wait briefly and rerun `npm run verify:browser`; if the failure repeats, pause the demo until Supabase connectivity is stable.
