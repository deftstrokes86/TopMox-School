# TopMox Client Handoff Notes

## What Has Been Built

TopMox Global Tutoring now has the core MVP workflow for a school-backed online tutoring business:

- Public marketing pages for the tutoring offer.
- Parent registration/login and onboarding.
- Child profiles.
- Assessment request, scheduling, outcome, and recommendation flow.
- Plan acceptance and enrollment creation.
- Flutterwave payment foundation with manual transfer fallback.
- Manual payment review and enrollment activation.
- Tutor assignment and lesson scheduling.
- Tutor lesson delivery, notes, concern flags, and homework.
- Parent lesson visibility, homework visibility, and published reports.
- Admin report review and publishing.
- Support requests and admin communication logs.
- In-app notifications and activity feeds.
- Resource articles for parent education and SEO support.
- Role-safe admin, parent, and tutor dashboards.
- Stability coverage with route smoke checks and browser smoke checks.

## MVP-Ready

The MVP-ready parts are:

- Demoable public website.
- Demoable parent, admin, and tutor dashboards.
- Assessment-to-recommendation-to-payment-to-lesson workflow.
- Manual payment verification workflow.
- Lesson notes, homework, and report visibility.
- Support request workflow.
- Demo resources and demo seed data.
- Browser smoke testing for blank-screen prevention.

This is ready for a client walkthrough and internal operational trial once real environment variables and database access are configured.

## What Requires Real TopMox Content

Before launch, TopMox should provide:

- Final homepage copy and service positioning.
- Real subject and exam-prep messaging.
- Real parent FAQs.
- Real school credibility proof, such as school history, leadership information, accreditations if applicable, and parent-safe testimonials only if verified.
- Real resource articles or approval of the seeded demo resources.

## What Requires Flutterwave Account Setup

Flutterwave account setup is required before live checkout can be used:

- `FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_SECRET_HASH`
- `FLUTTERWAVE_BASE_URL`
- `APP_BASE_URL`
- Approved currencies and methods in the Flutterwave merchant account.
- A verified webhook URL for production.

Enrollment activation should remain locked to verified successful Flutterwave payments or admin-approved manual payments.

## What Requires Real Tutor List

TopMox should provide:

- Tutor names.
- Tutor subjects and class levels.
- Tutor bios.
- Availability windows.
- Timezone coverage.
- Internal rules for assigning tutors to children.

## What Requires Real Pricing

TopMox should confirm:

- Plan names.
- Sessions per week.
- Monthly prices.
- Supported currencies.
- Whether international pricing differs by country.
- Manual payment policy.
- Refund and cancellation rules.

## What Requires Real School Branding Assets

The launch should use real school branding assets rather than demo placeholders.

TopMox should provide:

- Official logo files.
- Brand colors if different from the current warm academic palette.
- School photographs or approved visual assets.
- Founder or leadership bio if used publicly.
- Social proof assets that are verified and approved.

## What Should Be Launched First

The recommended launch first path is a controlled assessment-to-payment pilot, not every future feature at once.

Recommended launch sequence:

1. Launch public pages and parent registration.
2. Enable assessment request intake.
3. Let admin manually review assessment requests.
4. Start with manual payment fallback if Flutterwave production setup is not finished.
5. Add Flutterwave live checkout once account and webhook verification are complete.
6. Operate with a small tutor list first.
7. Use progress reports as a retention checkpoint after the first month.

## Recommended Paid Next Steps

Recommended paid next steps should focus on deployment, payment readiness, real content, and operational training.

1. Production deployment setup with database, domain, auth secret, and environment variables.
2. Flutterwave production configuration, callback, and webhook test with real merchant credentials.
3. Real TopMox brand asset integration.
4. Real pricing and plan configuration.
5. Tutor roster import and operating procedures.
6. Admin training walkthrough and demo-data reset procedure.
7. First live-parent pilot with a small controlled group.
8. Post-pilot polish based on real admin, parent, and tutor feedback.

## Launch Notes

- Do not enable demo login in production unless intentionally configured for a private staging demo.
- Keep manual payment verification available as a fallback.
- Do not promise guaranteed academic outcomes.
- Keep parent-facing language focused on clarity, structure, visibility, and support.
- Use browser smoke checks before client calls and before deployment.
