# TopMox Global Tutoring System Architecture

## 1. Purpose of This Document

This document defines the **technical architecture** of TopMox Global Tutoring.

It covers:

- Application architecture
- Folder structure
- Rendering strategy
- Database architecture
- Authentication and authorization
- Server actions and queries
- Validation
- Data access patterns
- Security
- Testing
- Deployment
- Future integrations

`system-design.md` explains **product behavior and workflows**.
This file explains **how the system should be technically structured** to implement those workflows reliably.

---

## 2. Architecture Summary

TopMox Global Tutoring should be implemented as a **modular Next.js application**.

### Recommended Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- Prisma
- PostgreSQL
- Auth.js (or equivalent)
- Zod
- React Hook Form
- Server Actions where appropriate
- In-app notifications
- Flutterwave as the primary live payment gateway
- Manual payment tracking as fallback
- Payment provider abstraction for gateway and fallback adapters

### Architecture Style

- Modular monolith
- Role-based dashboards
- Server-side data access
- Strong validation at boundaries
- Clear separation between UI, validation, database, and business actions
- Database-backed MVP (not mock-only)

### Why Modular Monolith for MVP

- Faster to build and iterate
- Easier to reason about for a small team
- Easier to deploy and operate
- Sufficient separation for clean ownership and future scaling
- Avoids premature microservices complexity

---

## 3. High-Level System Diagram

```txt
+-------------------+
|   User Browser    |
+---------+---------+
          |
          v
+---------------------------+
| Next.js App Router        |
| (Route Groups + Layouts)  |
+-------------+-------------+
              |
              v
+---------------------------+
| Server Components /       |
| Client Components         |
+-------------+-------------+
              |
              v
+---------------------------+
| Server Actions /          |
| Query Layer               |
+-------------+-------------+
              |
              v
+---------------------------+
| Authorization Layer       |
| (Role + Ownership checks) |
+-------------+-------------+
              |
              v
+---------------------------+
| Prisma ORM                |
+-------------+-------------+
              |
              v
+---------------------------+
| PostgreSQL Database       |
+---------------------------+
```

### External Services (Future)

- Email provider
- Payment gateways
- Storage provider
- Analytics provider
- WhatsApp notification provider

All external services should be accessed through internal provider interfaces/adapters.

---

## 4. Application Layers

### 4.1 Presentation Layer

Includes:

- Public pages
- Parent dashboard
- Tutor dashboard
- Admin dashboard
- Forms
- Tables
- Cards
- Reports

Technology:

- React
- Next.js Server Components
- Client Components only where interactivity is required
- Tailwind CSS
- shadcn/ui
- Framer Motion

Rules:

- Default to Server Components
- Use Client Components for forms, dialogs, dropdowns, interactive tables, mobile nav, charts, and stateful UI
- Keep business logic out of UI components

### 4.2 Validation Layer

Technology:

- Zod

Owns:

- Input validation
- Form schemas
- Server action validation
- Status transition validation where appropriate

Location:

- `/src/lib/validations`

### 4.3 Business Logic Layer

Owns:

- Assessment workflow
- Plan recommendation
- Enrollment activation
- Payment approval
- Tutor assignment
- Lesson status updates
- Report publishing
- Notification creation
- Communication logs

Location:

- `/src/server/actions`
- `/src/server/services`

### 4.4 Data Access Layer

Owns:

- Prisma queries
- Access-controlled reads
- Dashboard aggregations
- Record lookups

Location:

- `/src/server/queries`
- `/src/lib/db.ts`

Rules:

- Do not query Prisma directly from random UI components
- Prefer dedicated query functions
- Always apply role and ownership filters

### 4.5 Persistence Layer

Technology:

- PostgreSQL
- Prisma ORM

Owns:

- Users
- Profiles
- Students
- Tutors
- Subjects
- Plans
- Assessments
- Outcomes
- Enrollments
- Payments
- Lessons
- Homework
- Reports
- Support
- Notifications
- Communication logs
- Resources

### 4.6 Integration Layer

For future:

- Payment gateways
- Email
- WhatsApp
- PDF generation
- File storage
- Analytics

Location:

- `/src/server/integrations`

Rule:

All third-party services should be wrapped behind internal interfaces so the app is not tightly coupled to one provider.

---

## 5. Recommended Folder Structure

```txt
src/
  app/
    (public)/
    (auth)/
    parent/
    tutor/
    admin/
    api/
  components/
    marketing/
    dashboard/
    forms/
    reports/
    shared/
    ui/
  lib/
    auth/
    validations/
    constants/
    utils/
    db.ts
  server/
    actions/
    queries/
    services/
    integrations/
  styles/
prisma/
  schema.prisma
  seed.ts
docs/
  prd.md
  design.md
  task-list.md
  system-design.md
  system-architecture.md
```

### Folder Responsibilities

| Folder                    | What belongs here                                         | What should not belong here           |
| ------------------------- | --------------------------------------------------------- | ------------------------------------- |
| `src/app`                 | Routes, layouts, page-level composition                   | Shared business logic, raw DB calls   |
| `src/components`          | Reusable UI units and feature UI blocks                   | Prisma logic, auth checks             |
| `src/lib`                 | Utilities, constants, validation, auth helpers, db client | Feature-specific action orchestration |
| `src/server/actions`      | Request-bound mutations and command handlers              | UI rendering logic                    |
| `src/server/queries`      | Read models, aggregation queries, filtered retrieval      | Direct UI components                  |
| `src/server/services`     | Reusable domain/business workflows                        | Route/layout files                    |
| `src/server/integrations` | Third-party provider adapters                             | Core domain business rules            |
| `prisma`                  | Schema, migrations, seed scripts                          | UI components                         |
| `docs`                    | Product/architecture documents                            | Runtime code                          |

---

## 6. Route Architecture

Each dashboard route should be wrapped in a protected layout.

### Public Routes

- `/`
- `/global-tutoring`
- `/subjects`
- `/subjects/mathematics`
- `/subjects/english`
- `/subjects/science`
- `/subjects/reading-comprehension`
- `/exam-prep`
- `/pricing`
- `/about`
- `/contact`
- `/faq`
- `/locations`
- `/locations/[slug]`
- `/resources`
- `/resources/[slug]`

### Auth Routes

- `/login`
- `/register`
- `/forgot-password`

### Parent Routes

- `/parent`
- `/parent/onboarding`
- `/parent/children`
- `/parent/assessments`
- `/parent/lessons`
- `/parent/payments`
- `/parent/reports`
- `/parent/support`

### Tutor Routes

- `/tutor`
- `/tutor/lessons`
- `/tutor/students`
- `/tutor/homework`
- `/tutor/reports`

### Admin Routes

- `/admin`
- `/admin/parents`
- `/admin/students`
- `/admin/tutors`
- `/admin/assessments`
- `/admin/lessons`
- `/admin/plans`
- `/admin/payments`
- `/admin/reports`
- `/admin/support`
- `/admin/resources`
- `/admin/settings`

---

## 7. Rendering Strategy

### Server-rendered (default)

- Public content pages
- Dashboard shell
- Dashboard summary data
- Detail pages
- Report display pages

### Client Components (when interactivity is needed)

- Forms
- Multi-step onboarding
- Dialogs
- Filters
- Search controls
- Tabs
- Dropdowns
- Mobile nav
- Toasts
- Interactive charts
- Status update controls

Default policy: use Server Components unless interactive behavior requires client components.

---

## 8. Authentication Architecture

### Requirements

- Roles: `ADMIN`, `TUTOR`, `PARENT`
- Student has no independent auth in MVP
- Parent owns student profiles
- Tutor sees assigned data only
- Admin sees all data
- Protected layouts for role route groups
- Login redirects by role
- Demo login buttons may exist in development only

### Recommended Implementation

- Auth.js (or equivalent)
- Session includes `userId` and `role`
- Middleware and/or layout-level guards protect route groups
- Server-side helpers validate identity and role

### Required Helpers

- `getCurrentUser()`
- `requireAuth()`
- `requireRole(role)`
- `requireAdmin()`
- `requireParent()`
- `requireTutor()`
- `canAccessStudent(user, studentId)`
- `canAccessLesson(user, lessonId)`
- `canAccessReport(user, reportId)`

### Role Redirects

- `ADMIN` → `/admin`
- `TUTOR` → `/tutor`
- `PARENT` → `/parent`

---

## 9. Authorization and Data Isolation

### Parent

- Can only access own profile
- Can only access children under own parent profile
- Can only access own assessments
- Can only access own payments
- Can only access lessons for own children
- Can only access published reports for own children
- Can only access own support requests

### Tutor

- Can only access assigned lessons
- Can only access students linked to assigned lessons or explicit assignment
- Can create notes/homework only for assigned lessons
- Can draft reports only for assigned students

### Admin

- Can access all records

Every query/action must enforce access server-side.
UI hiding is not security.

---

## 10. Database Architecture

### Core Models

- `User`
- `Profile`
- `ParentProfile`
- `StudentProfile`
- `TutorProfile`
- `Subject`
- `TutoringPlan`
- `AssessmentRequest`
- `AssessmentOutcome`
- `Enrollment`
- `Lesson`
- `Homework`
- `Payment`
- `ProgressReport`
- `SupportRequest`
- `Notification`
- `CommunicationLog`
- `Resource`

### Model Definitions (Purpose, Key Fields, Relationships, Access)

#### User

- Purpose: global account identity and role
- Key fields: `id`, `email`, `passwordHash` (or provider identity), `role`, `createdAt`, `updatedAt`
- Relationships: 1:1 to role-specific profile (`ParentProfile`/`TutorProfile`) and/or generic `Profile`
- Access: self and admin; role drives dashboard access

#### Profile

- Purpose: optional shared profile metadata
- Key fields: `userId`, `fullName`, `phone`, `country`, `timezone`
- Relationships: belongs to `User`
- Access: self for parent/tutor, admin for all

#### ParentProfile

- Purpose: parent-specific account data
- Key fields: `id`, `userId`, onboarding fields
- Relationships: one parent owns many `StudentProfile`, `AssessmentRequest`, `Payment`, `Enrollment`
- Access: owning parent + admin

#### StudentProfile

- Purpose: child learner profile
- Key fields: `id`, `parentId`, `fullName`, `age`, `classOrYearGroup`, `curriculum`
- Relationships: belongs to `ParentProfile`; referenced by assessments, lessons, homework, reports
- Access: owning parent, assigned tutor (via assignment/lesson), admin

#### TutorProfile

- Purpose: tutor record
- Key fields: `id`, `userId`, `bio`, `specialties`, `active`
- Relationships: linked to assigned lessons, reports, assignments
- Access: self and admin

#### Subject

- Purpose: canonical subject taxonomy
- Key fields: `id`, `name`, `slug`, `active`
- Relationships: referenced by plans, assessments, lessons
- Access: public read (where needed), admin manage

#### TutoringPlan

- Purpose: package and recommendation target
- Key fields: `id`, `name`, `sessionsPerWeek`, `price`, `currency`, `description`, `status`
- Relationships: linked to recommendation/outcome and enrollment
- Access: admin manage, parent read when recommended/available

#### AssessmentRequest

- Purpose: intake request pipeline
- Key fields: `id`, `parentId`, `studentId`, `status`, `academicConcern`, `preferredDays`, `preferredTime`, `timezone`, `scheduledAt`, `meetingLink`
- Relationships: may link to `AssessmentOutcome`, recommended plan, communication logs
- Access: owner parent + admin + assigned tutor (if explicitly granted)

#### AssessmentOutcome

- Purpose: result of assessment and recommendation summary
- Key fields: `id`, `assessmentId`, `summary`, `recommendation`, `recommendedPlanId`, `recordedByAdminId`
- Relationships: 1:1/1:many with assessment; links to plan
- Access: admin create/update, parent read when shared

#### Enrollment

- Purpose: active tutoring relationship lifecycle
- Key fields: `id`, `parentId`, `studentId`, `planId`, `status`, `startDate`, `endDate`
- Relationships: ties parent, student, plan, payments, lessons
- Access: owner parent read, assigned tutor read (as needed), admin manage

#### Lesson

- Purpose: scheduled and delivered lesson unit
- Key fields: `id`, `parentId`, `studentId`, `tutorId`, `subjectId`, `enrollmentId`, `status`, `startTime`, `timezone`, `meetingLink`, `attendance`
- Relationships: has notes and optional homework
- Access: owner parent read, assigned tutor update, admin manage

#### Homework

- Purpose: assignment from lesson
- Key fields: `id`, `lessonId`, `studentId`, `status`, `title`, `instructions`, `dueDate`
- Relationships: linked to lesson/student
- Access: parent read, tutor create/update for assigned students, admin read/manage

#### Payment

- Purpose: Flutterwave checkout tracking, manual fallback tracking, and verified enrollment activation
- Key fields: `id`, `parentId`, `studentId`, `enrollmentId`, `amount`, `currency`, `status`, `paymentMethod`, `provider`, `providerReference`, `providerTransactionId`, `checkoutUrl`, `callbackUrl`, `proofUrl`, `adminNote`, `failureReason`, `metadata`, `verifiedAt`, `paidAt`
- Relationships: links to parent/enrollment/payment events and communication logs
- Access: owner parent create/read own, admin review manual payments, system verifies Flutterwave payments

#### PaymentEvent

- Purpose: idempotent provider event and callback processing
- Key fields: `id`, `provider`, `providerEventId`, `paymentId`, `eventType`, `rawPayload`, `processedAt`, `status`, `errorMessage`
- Relationships: optionally links to payment
- Access: system/admin operational data only

#### ProgressReport

- Purpose: periodic academic reporting and retention asset
- Key fields: `id`, `parentId`, `studentId`, `tutorId`, `status`, `month`, `strengths`, `improvementAreas`, `tutorComments`, `publishedAt`
- Relationships: links parent/student/tutor/lessons
- Access: admin manage/publish, tutor draft assigned, parent read published own

#### SupportRequest

- Purpose: parent support ticket lifecycle
- Key fields: `id`, `parentId`, `subject`, `message`, `status`, `priority`
- Relationships: may link communication logs and admin notes
- Access: owner parent + admin

#### Notification

- Purpose: in-app event messaging
- Key fields: `id`, `userId`, `type`, `title`, `message`, `href`, `readAt`, `createdAt`
- Relationships: belongs to user
- Access: recipient user + admin

#### CommunicationLog

- Purpose: operational memory for admin follow-up
- Key fields: `id`, `type`, `message`, `createdBy`, `parentId?`, `studentId?`, `assessmentId?`, `paymentId?`, `lessonId?`, `supportRequestId?`, `createdAt`
- Relationships: optionally linked across operational objects
- Access: admin only (default), optional controlled view to tutor for academic follow-ups

#### Resource

- Purpose: content library for public/parents
- Key fields: `id`, `title`, `slug`, `excerpt`, `content`, `category`, `status`, `createdAt`, `updatedAt`
- Relationships: standalone
- Access: published public read, admin manage all

### Recommended Indexes

- `User.email`
- `User.role`
- `StudentProfile.parentId`
- `AssessmentRequest.parentId`
- `AssessmentRequest.studentId`
- `AssessmentRequest.status`
- `Enrollment.parentId`
- `Enrollment.studentId`
- `Enrollment.status`
- `Payment.parentId`
- `Payment.enrollmentId`
- `Payment.status`
- `Payment.provider`
- `Payment.providerReference`
- `Payment.providerTransactionId`
- `PaymentEvent.provider`
- `PaymentEvent.providerEventId`
- `PaymentEvent.paymentId`
- `Lesson.parentId`
- `Lesson.studentId`
- `Lesson.tutorId`
- `Lesson.status`
- `Lesson.startTime`
- `ProgressReport.parentId`
- `ProgressReport.studentId`
- `ProgressReport.tutorId`
- `ProgressReport.status`
- `Notification.userId`
- `Notification.readAt`
- `Resource.slug`
- `Resource.status`

### Timestamps

All mutable entities should include:

- `createdAt`
- `updatedAt`

---

## 11. Data Flow Architecture

### 11.1 Assessment Request Data Flow

Client form  
→ Zod validation  
→ Server action  
→ Auth check  
→ Parent and child ownership check  
→ Prisma create assessment request  
→ Create notification for admin  
→ Redirect or success toast

### 11.2 Plan Recommendation Data Flow

Admin form  
→ Zod validation  
→ `requireAdmin()`  
→ Create assessment outcome  
→ Update assessment status to `PLAN_RECOMMENDED`  
→ Link recommended plan  
→ Create parent notification

### 11.3 Payment Approval Data Flow

Admin action  
→ `requireAdmin()`  
→ Fetch payment  
→ Update payment status to `PAID`  
→ Update enrollment status to `ACTIVE`  
→ Create parent notification  
→ Add communication log

### 11.4 Lesson Completion Data Flow

Tutor action  
→ `requireTutor()`  
→ Confirm lesson belongs to tutor  
→ Update attendance and status  
→ Save lesson notes  
→ Create homework if provided  
→ Notify parent  
→ Show update in parent dashboard

### 11.5 Report Publishing Data Flow

Tutor drafts report  
→ Admin reviews  
→ Admin publishes  
→ Parent notification created  
→ Parent can view report

---

## 12. Server Actions and Services

### Recommended Server Action Groups

- `/src/server/actions/auth.actions.ts`
- `/src/server/actions/parent.actions.ts`
- `/src/server/actions/student.actions.ts`
- `/src/server/actions/assessment.actions.ts`
- `/src/server/actions/plan.actions.ts`
- `/src/server/actions/enrollment.actions.ts`
- `/src/server/actions/payment.actions.ts`
- `/src/server/actions/tutor.actions.ts`
- `/src/server/actions/lesson.actions.ts`
- `/src/server/actions/homework.actions.ts`
- `/src/server/actions/report.actions.ts`
- `/src/server/actions/support.actions.ts`
- `/src/server/actions/notification.actions.ts`
- `/src/server/actions/resource.actions.ts`

### Recommended Service Groups

- `/src/server/services/assessment.service.ts`
- `/src/server/services/payment.service.ts`
- `/src/server/services/enrollment.service.ts`
- `/src/server/services/lesson.service.ts`
- `/src/server/services/report.service.ts`
- `/src/server/services/notification.service.ts`
- `/src/server/services/access-control.service.ts`

Server actions should handle request boundaries (input, auth, response), while services own reusable business logic.

---

## 13. Validation Architecture

### Zod Schema Locations

- `/src/lib/validations/auth.schema.ts`
- `/src/lib/validations/parent.schema.ts`
- `/src/lib/validations/student.schema.ts`
- `/src/lib/validations/assessment.schema.ts`
- `/src/lib/validations/plan.schema.ts`
- `/src/lib/validations/payment.schema.ts`
- `/src/lib/validations/lesson.schema.ts`
- `/src/lib/validations/homework.schema.ts`
- `/src/lib/validations/report.schema.ts`
- `/src/lib/validations/support.schema.ts`
- `/src/lib/validations/resource.schema.ts`

### Rules

- Validate client-side for UX
- Validate server-side for security
- Never trust client input
- Validate status transitions on server
- Validate ownership on server

---

## 14. UI Component Architecture

### Marketing

- `HeroSection`
- `TrustSection`
- `SubjectCard`
- `PlanCard`
- `HowItWorks`
- `FAQAccordion`
- `CTASection`

### Dashboard

- `DashboardShell`
- `DashboardSidebar`
- `DashboardTopbar`
- `StatCard`
- `DataTable`
- `StatusBadge`
- `ActivityFeed`
- `NotificationDropdown`
- `EmptyState`
- `MobileDashboardNav`

### Forms

- `ParentProfileForm`
- `ChildProfileForm`
- `AssessmentRequestForm`
- `AssessmentOutcomeForm`
- `PlanForm`
- `PaymentForm`
- `LessonForm`
- `HomeworkForm`
- `ReportForm`
- `SupportRequestForm`

### Reports

- `ProgressReportView`
- `ReportHeader`
- `ReportMetricCard`
- `ReportSection`
- `PrintButton`

### Shared

- `PageHeader`
- `ConfirmDialog`
- `LoadingState`
- `ErrorState`
- `SearchInput`
- `FilterSelect`

shadcn/ui should provide base primitives; project-specific components should compose/wrap them.

---

## 15. Dashboard Aggregation Architecture

### Admin Queries

- `getAdminDashboardMetrics()`
- `getAssessmentPipeline()`
- `getRevenueSummary()`
- `getTutorWorkload()`
- `getStudentsByCountry()`
- `getPopularSubjects()`
- `getRecentPayments()`
- `getUpcomingLessons()`
- `getReportsDue()`

### Parent Queries

- `getParentDashboard(parentUserId)`
- `getParentChildren(parentUserId)`
- `getParentLessons(parentUserId)`
- `getParentPayments(parentUserId)`
- `getParentReports(parentUserId)`

### Tutor Queries

- `getTutorDashboard(tutorUserId)`
- `getTutorLessons(tutorUserId)`
- `getTutorStudents(tutorUserId)`
- `getTutorReportsDue(tutorUserId)`

### Rules

- Aggregations must be server-side
- Parent and tutor aggregations must enforce ownership/assignment
- Admin aggregations may access all records

---

## 16. Notification Architecture

Notification model should support:

- `userId`
- `type`
- `title`
- `message`
- `href`
- `readAt`
- `createdAt`

Notification service should expose:

- `createNotification()`
- `createBulkNotifications()`
- `markNotificationRead()`
- `markAllNotificationsRead()`
- `getUserNotifications()`

For MVP:

- In-app only
- No email required yet

Future:

- Email provider subscribes to notification events
- WhatsApp provider subscribes to critical events

---

## 17. Payment Architecture

For MVP:

- Flutterwave checkout is the primary live payment path.
- Manual transfer remains available as fallback.
- Admin verification is used for manual payments.
- Enrollment activation happens only after verified successful Flutterwave payment or admin-approved manual payment.
- Supported currencies must include at least `NGN`, `USD`, `GBP`, `EUR`, and `CAD`.
- Available Flutterwave methods can vary by country, currency, merchant KYC, and account setup.

### Payment Provider Abstraction

- Define internal payment service interface
- Keep Flutterwave-specific logic in a Flutterwave adapter
- Keep manual fallback logic in a manual adapter/service
- Do not couple business logic directly to provider SDKs or HTTP details
- Do not add Stripe to the active payment stack

Internal adapter interface:

- `createCheckout()`
- `verifyPayment()`
- `handleWebhook()`

MVP payment methods:

- `FLUTTERWAVE`
- `MANUAL_TRANSFER`

Payment safety rules:

- Callback status alone is never trusted.
- Flutterwave webhooks must be verified.
- Amount, currency, provider reference, transaction id, parent ownership, and enrollment ownership must match before activation.
- Payment event processing must be idempotent.
- Duplicate callbacks/webhooks must not create duplicate state transitions.
- Manual payment never auto-activates enrollment.

---

## 17.1 Region and Currency Localization Architecture

TopMox is deployed as a Next.js Node.js app on Hostinger, not as a static
export. Location personalization must therefore be Hostinger-compatible and
must not rely on platform-specific geo headers.

Region resolution priority:

1. Manual selected region cookie: `topmox_region`.
2. Cloudflare `CF-IPCountry` if the domain is proxied through Cloudflare.
3. Optional custom country headers from future Hostinger/CDN configuration:
   `x-country-code`, `x-forwarded-country`, or `x-geo-country`.
4. Weak browser hints such as timezone and `Accept-Language`.
5. Nigeria fallback with NGN.

Supported public regions:

- Nigeria -> NGN
- United States -> USD
- Canada -> CAD
- Australia -> AUD
- United Kingdom -> GBP
- Europe -> EUR
- UAE -> AED

`global` remains an internal fallback code only. It is not shown in the public
country switcher, and the final visitor fallback is Nigeria/NGN.

Manual country selection always wins. Automatic detection is only a soft default.
The app must not trap visitors in a guessed country experience.
The homepage uses the resolved region to adapt headline, parent pain points,
benefits, and payment notes while keeping a visible country switcher.

Payment currency safety remains server-side. Public pricing context helps
parents understand the country context, but payment records must derive amount
and currency from the enrollment/plan data on the server. Manual payment
fallback remains available in every region. Online checkout may be disabled for
currencies that require account confirmation, especially AUD and AED.

Global tutoring, Locations, Resources, and FAQ are grouped under the About menu
in the main public navigation. FAQ remains available at `/faq`.

---

## 18. File and Storage Architecture

For MVP:

- File upload can be placeholder
- Payment proof can be represented by proof URL placeholder
- Real file storage can come later

Future storage options:

- Supabase Storage
- Cloudinary
- S3-compatible storage

Storage use cases:

- Payment proof
- Student documents
- Report PDFs
- Resource images
- Tutor profile images

Do not implement full storage until required.

---

## 19. Reporting Architecture

Progress reports should be **database records first**.

Parent-facing report page should be:

- Server-rendered
- Print-ready
- Accessible only to owning parent, assigned tutor, or admin
- Styled as a premium academic report

PDF export:

- Deferred
- MVP may include a non-functional **Download PDF** button
- Future implementation can use server-side PDF generation

---

## 20. Resource Content Architecture

Resource records should support:

- `title`
- `slug`
- `excerpt`
- `content`
- `category`
- `status`
- `createdAt`
- `updatedAt`

Public pages show only published resources.

Admin can create, edit, publish, and unpublish resources.

Future enhancements:

- SEO metadata fields
- Featured image
- Author field
- Rich editor
- Categories and tags

---

## 21. Security Architecture

### Requirements

- Server-side authorization for every protected action
- Role-based route protection
- Ownership checks
- Zod validation
- No direct client-side trust
- CSRF protection where applicable to chosen auth approach
- Password hashing handled by auth provider/strategy
- Environment variables never exposed to client bundles
- Admin-only destructive actions require confirmation
- Demo login only in development
- Avoid logging sensitive records in production

### Environment Variables

| Variable                       | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| `DATABASE_URL`                 | PostgreSQL connection string                    |
| `AUTH_SECRET`                  | Session/JWT signing secret                      |
| `NEXTAUTH_URL` (or equivalent) | Canonical auth callback URL                     |
| `APP_BASE_URL`                 | Base URL for payment callbacks and absolute links |
| `FLUTTERWAVE_PUBLIC_KEY`       | Flutterwave public key                          |
| `FLUTTERWAVE_SECRET_KEY`       | Flutterwave secret key                          |
| `FLUTTERWAVE_SECRET_HASH`      | Flutterwave webhook verification hash           |
| `FLUTTERWAVE_BASE_URL`         | Flutterwave API base URL                        |
| `NEXT_PUBLIC_FLUTTERWAVE_ENABLED` | Public feature flag for Flutterwave checkout |
| `NEXT_PUBLIC_MANUAL_PAYMENTS_ENABLED` | Public feature flag for manual fallback |
| `EMAIL_PROVIDER_KEY`           | Placeholder for future email notifications      |
| `PAYMENT_PROVIDER_SECRET`      | Placeholder for future payment integration      |
| `STORAGE_PROVIDER_KEY`         | Placeholder for future file storage integration |

---

## 22. Error Handling Architecture

### Strategy

- Server actions return structured success/error payloads
- Forms show field-level validation errors
- Unauthorized access redirects or returns 403 views
- Missing records return 404 views
- Unexpected errors return safe generic messages
- Admin dashboards should render meaningful empty states, not broken screens

### Common Error Cases

- Not authenticated
- Not authorized
- Record not found
- Invalid status transition
- Validation failed
- Payment already processed
- Lesson not assigned to tutor
- Parent does not own student

---

## 23. Testing Architecture

### Unit Tests

Cover:

- Status transition helpers
- Validation schemas
- Access-control helpers
- Dashboard aggregation helpers where practical

### Integration Tests

Cover:

- Assessment request creation
- Payment approval and enrollment activation
- Lesson completion
- Report publishing
- Parent data isolation
- Tutor data isolation

### Smoke Tests

Cover:

- Public pages render
- Login page renders
- Admin dashboard renders
- Parent dashboard renders
- Tutor dashboard renders

### Required Security/Behavior Test Cases

- Parent cannot access another parent’s child
- Tutor cannot access unassigned lesson
- Parent cannot approve payment
- Tutor cannot publish report
- Admin can approve payment
- Payment approval activates enrollment
- Report publishing creates notification
- Assessment plan recommendation creates parent notification

---

## 24. Performance Architecture

MVP performance rules:

- Use Server Components for data-heavy pages
- Avoid fetching large datasets in client components
- Paginate admin tables
- Add indexes for common filters
- Avoid unnecessary client-side state
- Use loading states for slower dashboard queries
- Keep dashboard payloads lean
- Use selective Prisma queries (`select`/`include` discipline)

Future enhancements:

- Caching public pages
- Query caching for dashboard metrics
- Background jobs for notifications
- Background jobs for report generation
- Analytics pipeline

---

## 25. Deployment Architecture

Recommended deployment:

- Hostinger Node.js hosting for a Next.js App Router application
- PostgreSQL on Supabase, Neon, Railway, Render, or managed provider
- Secure environment variable management
- Prisma migrations in deployment lifecycle
- Do not use static export because the app depends on NextAuth, Prisma, API
  routes, middleware, server actions, and Flutterwave callbacks/webhooks.

### Deployment Checklist

- Production `DATABASE_URL` set
- Auth secret configured
- Production domain configured
- Demo login disabled or dev-only
- Migrations applied
- Seed strategy decided
- Build passes
- Lint passes
- Typecheck passes
- Tests pass

### Verification Commands

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npx prisma migrate deploy`
- `npx prisma db seed` (if needed)

---

## 26. Future Scalability Plan

### Version 1.1

- Real email notifications
- Real payment gateway integration
- Real PDF generation
- File upload for payment proof
- SEO metadata for resources

### Version 1.2

- WhatsApp notifications
- Parent-tutor messaging
- Group lessons
- Calendar sync
- Enhanced analytics

### Version 2.0

- LMS capabilities
- Recorded lessons
- Question bank
- AI lesson summaries
- AI assessment recommendations
- Tutor payroll
- Mobile app
- Multi-school expansion

Architecture should enable these enhancements later without forcing them into MVP.

---

## 27. Architecture Decision Records

### ADR 001: Use Modular Monolith

Reason: faster MVP delivery, easier deployment, and enough internal separation.

### ADR 002: Use Flutterwave Primary With Manual Fallback

Reason: TopMox needs a live gateway that can support Nigerian and foreign-currency payments where available, while retaining manual transfer as an operational fallback. Stripe is not part of the active payment stack.

### ADR 003: No Independent Student Login in MVP

Reason: parent is the buyer/account owner; student login can come later.

### ADR 004: Use Server-Side Authorization

Reason: UI hiding is not security; all protected queries/actions must enforce access.

### ADR 005: Use Progress Reports as Retention Engine

Reason: visible evidence of improvement increases parent trust and retention.

### ADR 006: Defer LMS

Reason: tutoring operations and parent trust are higher priority than recorded-course complexity.

---

## 28. Architecture Completion Checklist

- [ ] Stack is defined
- [ ] Folder structure is defined
- [ ] Route architecture is defined
- [ ] Auth strategy is defined
- [ ] Authorization strategy is defined
- [ ] Database models are defined
- [ ] Data flows are defined
- [ ] Server actions are grouped
- [ ] Validation strategy is defined
- [ ] UI component architecture is defined
- [ ] Notification architecture is defined
- [ ] Payment abstraction is defined
- [ ] Security rules are defined
- [ ] Testing strategy is defined
- [ ] Deployment approach is defined
- [ ] Future scalability path is defined
