# TopMox Global Tutoring System Design

## 1. Purpose of This Document

This document defines how TopMox Global Tutoring behaves from a **system and workflow perspective**.

It focuses on:

- User roles
- Business workflows
- Feature modules
- State transitions
- Access rules
- Data ownership
- Operational logic
- Dashboard visibility
- MVP boundaries

This is **not** low-level technical architecture.
Low-level technical architecture (infrastructure, deployment, API topology, caching, etc.) belongs in `system-architecture.md`.

---

## 2. System Overview

TopMox Global Tutoring is the online tutoring arm of TopMox Schools and should operate as a **tutoring business operating system**, not just a marketing website.

The system should help TopMox:

- Capture parent leads.
- Register parents.
- Create child profiles.
- Manage assessment requests.
- Recommend tutoring plans.
- Track payments.
- Activate enrollments.
- Assign tutors.
- Schedule lessons.
- Record lesson notes.
- Assign homework.
- Publish progress reports.
- Support parents.
- Monitor business performance through dashboards.

### Core End-to-End Flow

Visitor  
→ Parent Registration  
→ Child Profile  
→ Assessment Request  
→ Admin Review  
→ Assessment Scheduled  
→ Assessment Outcome  
→ Plan Recommendation  
→ Plan Acceptance  
→ Payment Tracking  
→ Enrollment Activation  
→ Tutor Assignment  
→ Lesson Scheduling  
→ Lesson Delivery  
→ Homework and Notes  
→ Progress Report  
→ Retention

---

## 3. User Roles

### 3.1 Admin

Admin represents the TopMox owner or operations staff.

Admin can:

- Manage parents.
- Manage students.
- Manage tutors.
- Manage assessment requests.
- Record assessment outcomes.
- Recommend plans.
- Manage plans.
- Track and approve payments.
- Activate enrollments.
- Assign tutors.
- Schedule lessons.
- View lesson notes.
- Review and publish reports.
- Manage support requests.
- View business dashboards.

### 3.2 Parent

Parent is the buyer and account owner.

Parent can:

- Register.
- Complete onboarding.
- Create child profiles.
- Request assessments.
- View assessment status.
- View recommended plan.
- Accept plan.
- Create payment record.
- View payment status.
- View lessons.
- View homework.
- View lesson notes.
- View published reports.
- Create support request.

### 3.3 Student

Student is the learner.

For MVP:

- Student does not need independent login.
- Student is represented as a profile under the parent account.
- Student is attached to assessments, enrollments, lessons, homework, and reports.

### 3.4 Tutor

Tutor is a TopMox teacher or approved tutor.

Tutor can:

- View assigned lessons.
- View assigned students.
- Mark attendance.
- Complete lessons.
- Add lesson notes.
- Assign homework.
- Flag concerns.
- Draft progress reports.

---

## 4. Permission Matrix

| Permission                | Admin      | Parent   | Tutor         | Student Profile |
| ------------------------- | ---------- | -------- | ------------- | --------------- |
| View public website       | Yes        | Yes      | Yes           | Yes             |
| Register account          | Yes        | Yes      | Yes           | No              |
| Create child profile      | Admin only | Yes      | No            | No              |
| Request assessment        | Admin only | Yes      | No            | No              |
| View own assessment       | Yes        | Own only | Assigned only | No              |
| View all assessments      | Yes        | No       | No            | No              |
| Schedule assessment       | Yes        | No       | No            | No              |
| Record assessment outcome | Yes        | No       | No            | No              |
| Recommend plan            | Yes        | No       | No            | No              |
| Accept plan               | Admin only | Own only | No            | No              |
| Manage plans              | Yes        | No       | No            | No              |
| Create payment record     | Admin only | Own only | No            | No              |
| Approve payment           | Yes        | No       | No            | No              |
| View own lessons          | Yes        | Own only | Assigned only | No              |
| View assigned lessons     | Yes        | No       | Assigned only | No              |
| View all lessons          | Yes        | No       | No            | No              |
| Schedule lessons          | Yes        | No       | No            | No              |
| Mark attendance           | Admin only | No       | Assigned only | No              |
| Add lesson notes          | Admin only | No       | Assigned only | No              |
| Assign homework           | Admin only | No       | Assigned only | No              |
| Draft report              | Admin only | No       | Assigned only | No              |
| Publish report            | Yes        | No       | No            | No              |
| View own reports          | Yes        | Own only | Assigned only | No              |
| View all reports          | Yes        | No       | No            | No              |
| Create support request    | Admin only | Own only | No            | No              |
| Manage support requests   | Yes        | No       | No            | No              |
| View admin analytics      | Yes        | No       | No            | No              |

---

## 5. Core Product Workflows

### 5.1 Public Visitor to Assessment Request

#### Steps

1. Visitor lands on public website.
2. Visitor reviews service pages.
3. Visitor clicks **Book a Child Assessment**.
4. Visitor registers or logs in.
5. Visitor completes parent onboarding.
6. Visitor creates child profile.
7. Visitor submits assessment request.
8. System creates assessment record with `PENDING_REVIEW` status.
9. Admin sees request in dashboard.

#### Required Data

- Parent: full name, email, WhatsApp, country, timezone.
- Student profile: full name, age, class/year group, curriculum, focus subjects.
- Assessment request: main challenge, preferred days/time, notes.

#### Expected System Response

- Validation success: request accepted.
- Assessment record created and linked to parent + student.
- Status initialized as `PENDING_REVIEW`.
- Parent sees confirmation and status timeline.
- Admin queue updates with new pending assessment.
- Notification/event entry created for admin review.

### 5.2 Assessment Management Workflow

1. Admin reviews assessment request.
2. Admin may contact parent outside system.
3. Admin schedules assessment.
4. Admin adds meeting link and time.
5. Assessment status becomes `SCHEDULED`.
6. Parent sees scheduled details.
7. Assessment happens offline or through meeting link.
8. Admin marks assessment `COMPLETED`.
9. Admin records assessment outcome.
10. Admin recommends tutoring plan.
11. Status becomes `PLAN_RECOMMENDED`.

### 5.3 Plan Acceptance and Enrollment Workflow

1. Parent views recommended plan.
2. Parent accepts plan.
3. System creates enrollment record.
4. Enrollment starts as inactive or pending payment.
5. Parent proceeds to payment tracking step.
6. Admin later activates enrollment after payment verification.

### 5.4 Payment Workflow

Flutterwave is the primary live payment gateway. Manual transfer remains as a fallback.

#### Flutterwave Path

1. Parent accepts a recommended plan.
2. System creates an enrollment with `PENDING_PAYMENT`.
3. Parent starts Flutterwave checkout.
4. System creates a payment record with `PENDING` status.
5. Parent completes or abandons checkout outside the app.
6. Callback may return the parent to TopMox, but callback status alone is never trusted.
7. System verifies the transaction with Flutterwave and/or processes a verified webhook.
8. System checks amount, currency, provider reference, transaction id, parent ownership, and enrollment ownership.
9. If verification succeeds, payment becomes `PAID`.
10. Related enrollment becomes `ACTIVE`.
11. Parent sees updated payment and enrollment status.

#### Manual Fallback Path

1. Parent sees manual payment instructions or receives them from the admin team.
2. Parent creates a manual payment record and provides reference/proof if available.
3. Payment status becomes `AWAITING_VERIFICATION`.
4. Admin reviews payment.
5. Admin approves or rejects payment.
6. If approved, payment becomes `PAID`.
7. Related enrollment becomes `ACTIVE`.
8. If rejected, payment becomes `FAILED` and enrollment remains `PENDING_PAYMENT`.

Payment methods and currencies available through Flutterwave can vary by country, currency, merchant KYC, and account configuration. The system must support NGN, USD, GBP, EUR, and CAD where available without assuming Nigeria-only behavior.

Payment event handling must be idempotent. Duplicate callbacks or webhooks must not activate an enrollment twice.

### 5.5 Tutor Assignment Workflow

1. Admin views active or pending enrollment.
2. Admin selects tutor.
3. Tutor is assigned to student or lesson.
4. Tutor sees student in tutor dashboard.
5. Parent sees assigned tutor in parent dashboard.

### 5.6 Lesson Scheduling Workflow

1. Admin creates lesson.
2. Admin selects student, tutor, subject, enrollment, date, time, timezone, and meeting link.
3. Lesson status starts as `SCHEDULED`.
4. Parent sees upcoming lesson.
5. Tutor sees assigned lesson.
6. Admin can reschedule or cancel lesson.

### 5.7 Lesson Delivery Workflow

1. Tutor opens lesson.
2. Tutor marks attendance.
3. Tutor adds lesson notes.
4. Tutor assigns homework.
5. Tutor marks lesson completed.
6. Parent sees completed lesson notes and homework.
7. Admin sees lesson activity.

### 5.8 Homework Workflow

1. Tutor creates homework from lesson.
2. Homework status starts as `ASSIGNED`.
3. Parent sees homework in dashboard.
4. Homework can later move to `SUBMITTED`, `REVIEWED`, or `OVERDUE`.
5. MVP does not require complex file uploads.

### 5.9 Progress Report Workflow

1. Tutor drafts report.
2. Report status is `DRAFT`.
3. Admin reviews report.
4. Admin changes status to `PUBLISHED`.
5. Parent sees published report.
6. Notification is created.
7. Parent can print report.
8. Download PDF button may be non-functional in MVP.

### 5.10 Support Workflow

1. Parent creates support request.
2. Status starts as `OPEN`.
3. Admin reviews request.
4. Admin may add note.
5. Admin changes status to `IN_REVIEW`, `RESOLVED`, or `CLOSED`.
6. Parent sees updated status.

### 5.11 Communication Log Workflow

Communication logs are admin-side operational memory.

Logs can be attached to:

- Parent
- Student
- Assessment
- Payment
- Lesson
- Support request

Log types:

- `CALL`
- `WHATSAPP`
- `EMAIL`
- `INTERNAL_NOTE`
- `PAYMENT_FOLLOW_UP`
- `ACADEMIC_FOLLOW_UP`

---

## 6. State Machines

### 6.1 Assessment Status

Statuses:

- `PENDING_REVIEW`
- `SCHEDULED`
- `COMPLETED`
- `PLAN_RECOMMENDED`
- `CONVERTED`
- `DECLINED`

Allowed transitions:

- `PENDING_REVIEW` → `SCHEDULED`
- `PENDING_REVIEW` → `DECLINED`
- `SCHEDULED` → `COMPLETED`
- `COMPLETED` → `PLAN_RECOMMENDED`
- `PLAN_RECOMMENDED` → `CONVERTED`
- `PLAN_RECOMMENDED` → `DECLINED`

### 6.2 Payment Status

Statuses:

- `PENDING`
- `AWAITING_VERIFICATION`
- `PAID`
- `FAILED`
- `CANCELLED`
- `REFUNDED`

Allowed transitions:

- `PENDING` → `AWAITING_VERIFICATION`
- `PENDING` → `CANCELLED`
- `PENDING` → `PAID` only after verified successful Flutterwave payment
- `PENDING` → `FAILED` after verified failed Flutterwave payment
- `AWAITING_VERIFICATION` → `PAID`
- `AWAITING_VERIFICATION` → `FAILED`
- `PAID` → `REFUNDED`

Safety rules:

- Flutterwave callback status alone is not enough to move payment to `PAID`.
- Webhooks must be verified before processing.
- Amount, currency, transaction reference, and ownership must match the payment and enrollment.
- Manual payments can only become `PAID` through admin approval.
- Duplicate provider events must be treated idempotently.

### 6.3 Enrollment Status

Statuses:

- `ACTIVE`
- `PAUSED`
- `COMPLETED`
- `CANCELLED`

Suggested transitions:

- Created as pending payment or inactive.
- Payment approved → `ACTIVE`
- `ACTIVE` → `PAUSED`
- `PAUSED` → `ACTIVE`
- `ACTIVE` → `COMPLETED`
- `ACTIVE` → `CANCELLED`
- `PAUSED` → `CANCELLED`

If database enum does not include `PENDING`, enrollment should be treated as inactive until payment is approved.

### 6.4 Lesson Status

Statuses:

- `SCHEDULED`
- `COMPLETED`
- `MISSED`
- `RESCHEDULED`
- `CANCELLED`

Allowed transitions:

- `SCHEDULED` → `COMPLETED`
- `SCHEDULED` → `MISSED`
- `SCHEDULED` → `RESCHEDULED`
- `SCHEDULED` → `CANCELLED`
- `RESCHEDULED` → `SCHEDULED`
- `RESCHEDULED` → `CANCELLED`

### 6.5 Homework Status

Statuses:

- `ASSIGNED`
- `SUBMITTED`
- `REVIEWED`
- `OVERDUE`

Allowed transitions:

- `ASSIGNED` → `SUBMITTED`
- `ASSIGNED` → `OVERDUE`
- `SUBMITTED` → `REVIEWED`
- `OVERDUE` → `SUBMITTED`
- `OVERDUE` → `REVIEWED`

### 6.6 Progress Report Status

Statuses:

- `DRAFT`
- `REVIEW`
- `PUBLISHED`

Allowed transitions:

- `DRAFT` → `REVIEW`
- `REVIEW` → `DRAFT`
- `REVIEW` → `PUBLISHED`

`PUBLISHED` should not be edited casually. If editing is needed, create a revision or allow admin-only edit.

### 6.7 Support Status

Statuses:

- `OPEN`
- `IN_REVIEW`
- `RESOLVED`
- `CLOSED`

Allowed transitions:

- `OPEN` → `IN_REVIEW`
- `IN_REVIEW` → `RESOLVED`
- `RESOLVED` → `CLOSED`
- `CLOSED` → `OPEN` only if reopened by admin.

---

## 7. Core Data Ownership Rules

- Parent owns child profiles created under their account.
- Parent can only view their own children.
- Parent can only view assessments linked to their children.
- Parent can only view lessons linked to their children.
- Parent can only view payments linked to their account.
- Parent can only view published reports linked to their children.
- Tutor can only view assigned students and assigned lessons.
- Tutor can only create notes, homework, and reports for assigned students.
- Admin can view and manage all operational data.

---

## 8. Feature Modules and Responsibilities

### Public Website Module

Owns marketing pages, CTAs, subject pages, pricing pages, resource pages.

### Auth Module

Owns registration, login, logout, role redirects, protected routes.

### Parent Module

Owns onboarding, child profiles, assessments, payments, lessons, homework, reports, support.

### Admin Module

Owns operations, assessment management, payment verification, tutor assignment, lesson scheduling, reports, support, analytics.

### Tutor Module

Owns assigned lessons, assigned students, lesson notes, homework, report drafting.

### Assessment Module

Owns request, scheduling, outcome, recommendation.

### Plan and Enrollment Module

Owns tutoring plans, plan acceptance, enrollment lifecycle.

### Payment Module

Owns payment records, manual verification, gateway abstraction.

### Lesson Module

Owns scheduling, attendance, lesson status, notes, homework connection.

### Report Module

Owns progress report draft, review, publishing, parent display.

### Notification Module

Owns in-app notification creation and read status.

### Communication Log Module

Owns admin operational notes and contact history.

### Resource Module

Owns SEO and parent education content.

---

## 9. Dashboard Data Design

### 9.1 Admin Dashboard Metrics

| Metric              | Definition                                | Suggested Derivation                                                |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Total parents       | Count of registered parent accounts       | `COUNT(users WHERE role = PARENT)`                                  |
| Total students      | Count of student profiles                 | `COUNT(students)`                                                   |
| Active enrollments  | Enrollments currently active              | `COUNT(enrollments WHERE status = ACTIVE)`                          |
| Pending assessments | Assessments awaiting review or scheduling | `COUNT(assessments WHERE status IN (PENDING_REVIEW, SCHEDULED))`    |
| Scheduled lessons   | Future lessons scheduled                  | `COUNT(lessons WHERE status = SCHEDULED AND start_time >= now)`     |
| Completed lessons   | Lessons delivered                         | `COUNT(lessons WHERE status = COMPLETED)`                           |
| Active tutors       | Tutors with active assignment load        | `COUNT(DISTINCT tutor_id from active assignments)`                  |
| Monthly revenue     | Paid amounts for current month            | `SUM(payments.amount WHERE status = PAID AND paid_at within month)` |
| Pending payments    | Unverified payment submissions            | `COUNT(payments WHERE status = AWAITING_VERIFICATION)`              |
| Reports due         | Expected reports not yet published        | Rule-based count from enrollment/report schedule                    |
| Students by country | Distribution of students                  | Group by parent/student country field                               |
| Popular subjects    | Most selected learning support subjects   | Group count from assessments/enrollments/lessons                    |
| Tutor workload      | Lesson load per tutor                     | Count scheduled/completed lessons by tutor                          |
| Conversion funnel   | Assessment → Plan → Payment → Active      | Stage-by-stage counts and conversion percentages                    |
| Recent assessments  | Latest assessment submissions             | Sorted descending by created timestamp                              |
| Recent payments     | Latest payment records/updates            | Sorted descending by created timestamp                              |
| Upcoming lessons    | Next scheduled lessons                    | Sorted ascending by lesson time                                     |
| Revenue simulator   | Projection widget (non-authoritative)     | Price x active students or plan mix assumptions                     |

### 9.2 Parent Dashboard Data

Parent should see:

- Child profiles.
- Assessment status.
- Recommended plan.
- Active enrollment.
- Payment status.
- Upcoming lessons.
- Recent lesson notes.
- Homework tasks.
- Published reports.
- Support CTA.

### 9.3 Tutor Dashboard Data

Tutor should see:

- Today’s lessons.
- Upcoming lessons.
- Assigned students.
- Lesson notes pending.
- Homework assigned.
- Reports due.
- Student concern flags.

---

## 10. Notification Design

### Notification Triggers

- Assessment submitted.
- Assessment scheduled.
- Plan recommended.
- Plan accepted.
- Payment submitted.
- Payment approved.
- Payment rejected.
- Enrollment activated.
- Tutor assigned.
- Lesson scheduled.
- Lesson rescheduled.
- Lesson cancelled.
- Lesson completed.
- Homework assigned.
- Report published.
- Support request updated.

### Notification Payload Requirements

Each notification should include:

- Recipient
- Type
- Title
- Message
- Read/unread status
- Link to relevant record
- Created timestamp

For MVP, notifications are in-app only.

---

## 11. Validation Rules

### Parent

- Full name required.
- Email required and valid.
- WhatsApp number required.
- Country required.
- Timezone required.

### Student

- Full name required.
- Age required.
- Class/year group required.
- At least one subject required.

### Assessment

- Student required.
- Subject required.
- Academic concern required.
- Timezone required.

### Plan

- Name required.
- Sessions per week required.
- Currency required.
- Price must be non-negative.

### Payment

- Amount required.
- Currency required.
- Payment method required.
- Parent required.
- Enrollment required where applicable.

### Lesson

- Student required.
- Tutor required.
- Subject required.
- Date and time required.
- Timezone required.

### Report

- Student required.
- Tutor required.
- Reporting month required.
- Strengths required.
- Areas needing improvement required.
- Tutor comments required.

---

## 12. Error and Empty State Design

### Expected Empty States

- No child profiles.
- No assessment requests.
- No lessons.
- No payments.
- No reports.
- No homework.
- No support requests.
- No tutor assignments.
- No resources.

### Expected Error States

- Unauthorized access.
- Missing required profile.
- Invalid form submission.
- Payment approval failed.
- Lesson scheduling conflict placeholder.
- Record not found.
- Parent attempting to access another parent’s data.
- Tutor attempting to access unassigned student.

---

## 13. MVP Boundary Rules

### Features Allowed in MVP

- Auth.
- Role dashboards.
- Parent onboarding.
- Child profiles.
- Assessment management.
- Plan recommendation.
- Manual payment tracking.
- Enrollment activation.
- Tutor management.
- Lesson scheduling.
- Lesson notes.
- Homework.
- Progress reports.
- Support requests.
- Communication logs.
- In-app notifications.
- Resource library.

### Features Deferred

- Full LMS.
- Video classroom engine.
- Real-time chat.
- Tutor payroll.
- Mobile app.
- AI tutor.
- Automated WhatsApp.
- Advanced subscriptions.
- Complex timetable automation.
- Real PDF generation.
- Question bank.

---

## 14. System Design Risks

| Risk                                     | Impact                                           | Mitigation                                                                  |
| ---------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| Scope creep                              | Delays MVP launch and quality                    | Enforce phased delivery from task list and strict change control            |
| Dashboard overbuild before core workflow | Analytics-heavy UI with weak operations backbone | Prioritize assessment-to-payment-to-lesson workflow before advanced widgets |
| Payment gateway complexity               | Blocks go-live timeline                          | Keep MVP manual verification, abstract gateway interface for later          |
| Tutor workflow complexity                | Low tutor adoption, incomplete lesson records    | Keep tutor screens minimal and action-driven with clear defaults            |
| Parent dashboard clutter                 | Lower trust and engagement                       | Prioritize core visibility cards: status, lessons, homework, reports        |
| Weak access control                      | Serious data privacy breach                      | Enforce ownership checks at query and action layers                         |
| Reporting burden too high                | Tutors/admin skip regular reports                | Use structured templates and monthly cadence with reminders                 |
| LMS features built too early             | Engineering dilution                             | Keep non-goals explicit and defer advanced classroom features               |

---

## 15. Completion Checklist

System design is complete when:

- [ ] User roles are clear.
- [ ] Core workflows are documented.
- [ ] Status transitions are documented.
- [ ] Access rules are documented.
- [ ] Data ownership rules are documented.
- [ ] Dashboard data requirements are documented.
- [ ] Notification triggers are documented.
- [ ] Validation rules are documented.
- [ ] MVP boundaries are documented.
