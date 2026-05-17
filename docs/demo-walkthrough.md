# TopMox Client Demo Walkthrough

## Demo Positioning

TopMox already has the school. This platform turns that school credibility into an international tutoring business.

The demo should feel like a business operating system, not only a website. The story is that TopMox can attract parents, assess children, recommend plans, collect and verify payments, assign tutors, schedule lessons, show homework and notes, publish reports, and support families from one structured platform.

## Demo Accounts

Use these only for local or staged walkthroughs. Demo login is controlled by `NEXT_PUBLIC_DEMO_LOGIN_ENABLED` and remains disabled in production by default.

| Role | Email | Walkthrough use |
| --- | --- | --- |
| Admin | `admin@topmox.test` | Operations dashboard, assessments, payments, lessons, reports, support, resources |
| Tutor | `amara.math@topmox.test` | Mathematics and Science lessons, homework, reports |
| Tutor | `david.english@topmox.test` | English and Reading lessons, homework, reports |
| Parent | `ngozi.parent@topmox.test` | Nigeria parent with active plan, lessons, homework, report, support |
| Parent | `bola.ukparent@topmox.test` | UK parent with scheduled assessment and pending payment review |
| Parent | `ada.canadaparent@topmox.test` | Canada parent with exam-prep history and Flutterwave payment example |

Demo-only password: `demo-only-change-me`.

## Demo Order

1. Homepage
2. Global tutoring page
3. Book assessment flow
4. Parent dashboard
5. Parent assessment/recommendation
6. Parent payment/enrollment
7. Admin assessment management
8. Admin payment review
9. Admin tutor assignment/lesson scheduling
10. Tutor lesson delivery/homework
11. Parent lesson notes/homework
12. Progress report
13. Support request
14. Notifications/activity
15. Admin dashboard

## Talking Points

### 1. Homepage

- Position TopMox as a trusted school-backed tutoring provider.
- Emphasize clarity, structure, and international parent access.
- Point out the primary CTA: book a child assessment.

### 2. Global Tutoring Page

- Explain the diaspora opportunity: Nigeria, the UK, Canada, and other countries.
- Stress that payment methods and currencies depend on Flutterwave and account configuration.
- Keep the promise realistic: structured support and visibility, not guaranteed grades.

### 3. Book Assessment Flow

- Show that the platform captures structured child and academic context.
- Explain why assessment-first avoids recommending the wrong tutoring plan.
- If unauthenticated, show that protected flow redirects safely to login.

### 4. Parent Dashboard

- Use `ngozi.parent@topmox.test` for the strongest parent story.
- Show child profiles, next action, active plan, payment state, next lesson, homework, report, support, and notifications.
- Explain that the parent always knows what happened and what comes next.

### 5. Parent Assessment/Recommendation

- Open parent assessments and show recommendation language.
- Emphasize clarity: the parent no longer has to guess where to begin.
- Explain that plan acceptance creates enrollment but does not bypass payment verification.

### 6. Parent Payment/Enrollment

- Show tutoring plan status and payment status.
- Explain Flutterwave as the primary live gateway and manual transfer as fallback.
- Stress that enrollment activation only happens after verified successful gateway payment or admin-approved manual payment.

### 7. Admin Assessment Management

- Use `admin@topmox.test`.
- Show pending, scheduled, completed, and recommended assessment states.
- Explain how operations can schedule assessments, record outcomes, and recommend plans.

### 8. Admin Payment Review

- Show payments awaiting verification.
- Explain that manual payments require admin review.
- Explain that Flutterwave payments require server-side verification, not callback status alone.

### 9. Admin Tutor Assignment/Lesson Scheduling

- Show active enrollments and tutor assignment.
- Show lesson scheduling with tutor, student, subject, time, timezone, and meeting link.
- Explain that parents and tutors receive visibility after scheduling.

### 10. Tutor Lesson Delivery/Homework

- Use `amara.math@topmox.test` for Mathematics/Science or `david.english@topmox.test` for English/Reading.
- Show assigned lessons, completion notes, concern flag handling, and homework assignment.
- Emphasize simple tutor workflow and accountability.

### 11. Parent Lesson Notes/Homework

- Return to the parent account and show completed lesson notes and homework.
- Explain that the parent can see evidence of delivery without needing to chase the tutor.

### 12. Progress Report

- Show published parent report.
- Explain that progress reports are retention assets: parents can see what is happening, where the child is improving, and what comes next.
- Mention that real PDF generation is deferred; print view is available.

### 13. Support Request

- Show support request creation and admin-side management.
- Explain that communication logs give admin operational memory without exposing internal notes to parents.

### 14. Notifications/Activity

- Show notification center and activity feed.
- Explain that in-app notifications are the current MVP channel, with email and WhatsApp deferred.

### 15. Admin Dashboard

- End with the operations view: assessments, payments, active enrollments, lessons, reports, support, and recent activity.
- Frame this as the cockpit TopMox needs to run the online tutoring business.

## Demo Data Checklist

- Parent in Nigeria with active enrollment, paid payment, scheduled/completed lessons, homework, published report, support request, and notifications.
- Parent in United Kingdom with scheduled assessment and payment awaiting verification.
- Parent in Canada with exam-prep history, Flutterwave payment examples, and report in review.
- Mathematics/Science tutor with assigned lessons and homework.
- English/Reading tutor with assigned lessons and report work.
- Admin queues include assessments, payments, lessons, reports, support requests, communication logs, and resources.

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

If the local database is unavailable, `/api/health` may report degraded and Prisma may log `P1001`. That is acceptable for browser smoke only if pages still render safely. For a live demo with seeded dashboards, start PostgreSQL and run `npm run prisma:seed` first.
