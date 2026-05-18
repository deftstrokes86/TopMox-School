# TopMox Client Handoff Notes

## What Has Been Built

TopMox Global Tutoring now has the core MVP workflow for a school-backed online tutoring business:

- Public marketing site for the tutoring offer.
- Parent registration, login, and onboarding.
- Child profiles with academic context.
- Assessment request system.
- Admin assessment management.
- Assessment outcome and recommendation workflow.
- Plan acceptance and enrollment creation.
- Flutterwave payment infrastructure with manual transfer fallback.
- Manual payment review and enrollment activation.
- Tutor assignment.
- Lesson scheduling.
- Tutor lesson notes, attendance, and concern flags.
- Homework assignment and parent visibility.
- Progress report drafting, admin review, publishing, and parent visibility.
- Support requests.
- Admin communication logs.
- In-app notifications.
- Activity feeds.
- Resources/content management with draft, published, and archived states.
- Location pages for Nigeria, United States, Canada, Australia, United Kingdom,
  Europe, and UAE.
- Cookie-first country switching with region-specific pricing context.
- Role-based dashboards for Admin, Parent, and Tutor.
- Auth/RBAC and ownership checks.
- Browser stability checks for blank-screen prevention.

## What Is MVP-Ready

The MVP is demo-ready and can support a staging walkthrough if verification passes in the target environment.

MVP-ready areas include:

- Public website and assessment-first offer.
- Parent dashboard and family workflow.
- Admin operational dashboard.
- Tutor lesson workflow.
- Assessment-to-recommendation-to-payment-to-lesson story.
- Manual payment verification flow.
- Flutterwave foundation, pending real account configuration and live testing.
- Lesson notes, homework, and progress report visibility.
- Support request workflow.
- Demo data and demo accounts for a controlled client walkthrough.
- Route, browser, auth, RBAC, and smoke verification scripts.

Production readiness still depends on real TopMox content, real Flutterwave configuration, final pricing, real tutor information, and final client approval.

## What TopMox Needs To Provide

TopMox should provide:

- Real school logo and brand assets.
- Official contact details.
- Real tutor list.
- Tutor bios, subjects, levels, and availability.
- Real pricing/packages.
- Real Flutterwave account details.
- Real payment and currency policy.
- Real subject coverage.
- Real lesson availability rules.
- Real parent-facing terms, privacy, refund, and cancellation policies.
- Real school history/about content.
- Real testimonials, only if available and approved.
- Final public copy for homepage, global tutoring, pricing, FAQs, and resources.

## What Requires Configuration

The staging or production environment must configure:

- Supabase/PostgreSQL connection string.
- `AUTH_SECRET`.
- `NEXTAUTH_URL`.
- `APP_BASE_URL`.
- Flutterwave public key.
- Flutterwave secret key.
- Flutterwave secret hash.
- Flutterwave webhook URL.
- Flutterwave callback URL.
- Production domain.
- Hostinger Node.js app hosting.
- Optional Cloudflare `CF-IPCountry` support for soft country detection.
- Country selector cookie `topmox_region`.
- Nigeria/NGN as the safe default when no region signal is available.
- Global tutoring, Locations, Resources, and FAQ are grouped under About in the
  main public navigation. FAQ remains accessible at `/faq`.
- Demo login disabled for production with `NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"`.
- Manual payment enablement policy.
- Seed strategy for demo, staging, and production.

## What Requires Real TopMox Content

Real TopMox content should replace or approve demo copy before launch:

- School credibility story.
- Leadership or founder profile if used publicly.
- Real tutoring methodology.
- Parent FAQs.
- Subject descriptions.
- Exam-prep scope.
- Parent resource articles.
- Any testimonials or social proof.

## What Requires Flutterwave Account Setup

Flutterwave account setup is required before live checkout can be used:

- Merchant account verification.
- Approved countries and currencies.
- Public and secret keys.
- Secret hash.
- Webhook endpoint configuration.
- Callback URL configuration.
- End-to-end live or test-mode payment verification.

Flutterwave available methods vary by country/currency/account setup. Enrollment activation must remain locked to verified successful Flutterwave payment or admin-approved manual payment.

## What Requires Real Tutor List

TopMox should provide a real tutor roster before launch:

- Tutor names.
- Tutor subjects.
- Tutor levels or age bands.
- Tutor timezones.
- Tutor availability.
- Tutor onboarding instructions.
- Admin rules for matching tutors to students.

## What Requires Real Pricing

TopMox should confirm:

- Plan names.
- Sessions per week.
- Monthly prices.
- Supported currencies.
- Whether international pricing differs by country.
- Whether AUD and AED should use manual payment or another TopMox-approved fallback until
  Flutterwave collection is confirmed.
- Manual payment fallback policy.
- Refund, pause, cancellation, and renewal rules.

## What Requires Real School Branding Assets

The launch should use real school branding assets rather than demo placeholders:

- Official logo files.
- Approved color palette if different from the current warm academic direction.
- School photographs or approved imagery.
- Founder or leadership bio if used publicly.
- Verified social proof assets if available.

## What Should Launch First

The recommended launch first path is a controlled assessment-to-payment pilot, not every future feature at once.

Recommended sequence:

1. Launch public pages and parent registration.
2. Enable assessment request intake.
3. Let admin manually review assessment requests.
4. Start with manual payment fallback if Flutterwave live setup is not finished.
5. Add Flutterwave live checkout after webhook and callback verification are tested.
6. Operate with a small tutor list first.
7. Use lesson notes, homework, and progress reports as the first retention loop.

## Recommended Paid Next Steps

Recommended paid next steps should focus on launch readiness, real operations, and client adoption:

1. Real branding/content pass.
2. Real Flutterwave live-mode setup.
3. Production deployment.
4. Admin training.
5. Tutor onboarding.
6. Parent onboarding script.
7. Real pricing and plan configuration.
8. First live-parent pilot support.
9. WhatsApp/email automation after the core workflow is stable.
10. Real PDF export for reports.
11. SEO/content expansion.
12. Optional LMS features later.

## Risks And Assumptions

- Supabase pooler/network reliability should be monitored, especially during long demos and browser verification runs.
- Demo data is not production data.
- No guaranteed grade promises should be made.
- Real payment testing is required before production payment launch.
- Real Flutterwave payment methods may differ by country, currency, merchant KYC, and account settings.
- Location detection is a helpful starting point only. Manual country selection
  always wins, and unknown geo data falls back to Nigeria/NGN.
- Hostinger does not provide country headers by default. Cloudflare can provide
  `CF-IPCountry` if configured.
- Demo login must remain disabled in production unless deliberately enabled for a private staging walkthrough.
- Seed data should not be run against production unless TopMox intentionally wants demo records there.
- Manual payment fallback requires operational discipline from the admin team.

## Launch Notes

- Keep manual payment verification available as a fallback.
- Do not publish fake testimonials.
- Do not publish fake bank details.
- Do not promise guaranteed academic outcomes.
- Keep parent-facing language focused on clarity, structure, visibility, and support.
- Use browser smoke checks before client calls and before deployment.
