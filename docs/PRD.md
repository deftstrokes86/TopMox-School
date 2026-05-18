# prd.md

# TopMox Global Tutoring PRD

## 1. Product Name

**TopMox Global Tutoring**

A school-backed online tutoring platform powered by TopMox Schools.

---

## 2. Product Thesis

TopMox Schools already has educational credibility. The opportunity is to turn that credibility into a structured online tutoring business for parents in Nigeria and abroad.

The platform should help TopMox:

1. Attract parents.
2. Capture structured enquiries.
3. Assess children.
4. Recommend tutoring plans.
5. Collect and track payments.
6. Assign tutors.
7. Schedule lessons.
8. Record lesson progress.
9. Show parents visible evidence of improvement.
10. Retain parents through accountability and progress reports.

This is not just a school website.  
This is a tutoring business operating system.

---

## 3. Core Product Promise

TopMox Global Tutoring helps parents give their children structured academic support through experienced educators, live online lessons, clear learning plans, tutor accountability, and regular progress reporting.

---

## 4. Primary Target Users

### 4.1 Parent

The main buyer.

Typical parent profile:

- Lives in Nigeria, UK, US, Canada, Ireland, Europe, UAE, or another diaspora location.
- Wants academic support for their child.
- Wants a trusted tutor, not a random freelancer.
- Wants visibility into progress.
- May need help with Maths, English, Science, Reading, Homework, or Exam Prep.
- Wants flexible online lessons.

Parent goals:

- Book assessment.
- Create child profile.
- Understand what the child needs.
- Pay for a plan.
- Track lessons and homework.
- See progress reports.
- Communicate issues easily.

---

### 4.2 Student

The learner.

Student goals:

- Attend lessons.
- Receive homework.
- Improve confidence.
- Improve academic performance.

For MVP, students do not need independent login.  
Student profiles are managed under parent accounts.

---

### 4.3 Tutor

TopMox teacher or approved tutor.

Tutor goals:

- See assigned students.
- See upcoming lessons.
- Mark attendance.
- Add lesson notes.
- Assign homework.
- Create progress updates.
- Flag struggling students.

---

### 4.4 Admin

TopMox business/admin team.

Admin goals:

- Manage parents.
- Manage students.
- Manage tutors.
- Review assessment requests.
- Schedule assessments.
- Recommend plans.
- Track payments.
- Assign tutors.
- Schedule lessons.
- Monitor reports.
- Track revenue and operations.

---

## 5. MVP Objective

Build a functional commercial MVP that TopMox can use to launch an online tutoring business.

The MVP must be strong enough to demonstrate:

- Parent acquisition.
- Parent onboarding.
- Child assessment.
- Tutoring plan recommendation.
- Payment tracking.
- Tutor assignment.
- Lesson scheduling.
- Lesson notes.
- Homework.
- Progress reports.
- Admin business visibility.

---

## 6. MVP Success Criteria

The MVP is successful if:

1. A parent can register.
2. A parent can create one or more child profiles.
3. A parent can request an assessment.
4. Admin can review and manage assessment requests.
5. Admin can recommend a tutoring plan.
6. A parent can accept a plan.
7. A payment record can be created and tracked.
8. Admin can verify manual payment.
9. Admin can assign a tutor.
10. Admin can schedule lessons.
11. Tutor can view assigned lessons.
12. Tutor can mark attendance and add lesson notes.
13. Tutor or admin can create progress reports.
14. Parent can view lessons, notes, homework, payments, and reports.
15. Admin can see business metrics from a dashboard.

---

## 7. Non-Goals for MVP

The MVP should not include:

- Full LMS with recorded courses.
- Live video classroom engine.
- Real-time chat.
- Tutor payroll.
- AI tutor.
- Mobile app.
- Complex subscription billing.
- Stripe integration.
- Parent community.
- Multi-school franchise system.
- Advanced automated timetable engine.
- Automated WhatsApp integration.
- Complex exam question bank.

These can come later after the core tutoring business workflow is proven.

---

## 7.1 Payment Gateway Direction

Flutterwave is the primary live payment gateway for TopMox Global Tutoring.

Manual transfer remains available as a fallback path when a parent cannot or should not use live checkout.

The payment layer must support NGN and foreign currencies such as USD, GBP, EUR, and CAD where available. Actual Flutterwave payment methods can vary by country, currency, merchant KYC, and Flutterwave account configuration, so the product must not assume Nigeria-only payment behavior.

Enrollment activation must only happen after:

- A verified successful Flutterwave transaction, or
- Admin approval of a manual payment fallback.

Callback status alone must never activate an enrollment. Webhooks must be verified, and amount, currency, transaction reference, and ownership must be checked before payment success changes enrollment status.

---

## 8. Product Principles

### 8.1 Revenue First

Every feature must support one of these:

- Acquiring parents.
- Converting parents.
- Managing tutoring operations.
- Retaining parents.

### 8.2 Parent Trust

Parents must feel that TopMox is structured, accountable, and serious.

### 8.3 Admin Clarity

The admin dashboard must make the business visible.

### 8.4 Tutor Simplicity

Tutors should not need training to use the system.

### 8.5 MVP Discipline

No feature should be added unless it strengthens the assessment-to-payment-to-progress workflow.

---

## 9. Core User Journey

### 9.1 Parent Journey

1. Parent visits public website.
2. Parent reads about TopMox Global Tutoring.
3. Parent clicks â€œBook a Child Assessment.â€
4. Parent registers or logs in.
5. Parent creates profile.
6. Parent creates child profile.
7. Parent submits assessment request.
8. Admin reviews request.
9. Admin schedules assessment.
10. Assessment is completed offline via Zoom, Google Meet, phone, or in person.
11. Admin records outcome.
12. Admin recommends tutoring plan.
13. Parent accepts plan.
14. Parent makes payment or uploads proof.
15. Admin verifies payment.
16. Admin assigns tutor.
17. Admin schedules lessons.
18. Tutor teaches and records notes.
19. Parent sees lessons, homework, and reports.
20. Parent continues monthly.

---

### 9.2 Admin Journey

1. Admin logs in.
2. Admin sees dashboard summary.
3. Admin reviews new assessment requests.
4. Admin schedules assessment.
5. Admin records assessment outcome.
6. Admin recommends plan.
7. Admin tracks payment.
8. Admin verifies payment.
9. Admin assigns tutor.
10. Admin schedules lessons.
11. Admin monitors lesson completion.
12. Admin reviews or publishes progress reports.
13. Admin tracks active students, revenue, reports due, tutor workload, and pending actions.

---

### 9.3 Tutor Journey

1. Tutor logs in.
2. Tutor sees todayâ€™s lessons.
3. Tutor opens lesson.
4. Tutor marks attendance.
5. Tutor adds lesson notes.
6. Tutor assigns homework.
7. Tutor flags student concern if needed.
8. Tutor drafts progress report when due.

---

## 10. Information Architecture

### Public Routes

```txt
/
 /global-tutoring
 /subjects
 /subjects/mathematics
 /subjects/english
 /subjects/science
 /subjects/reading-comprehension
 /exam-prep
 /pricing
 /about
 /contact
 /faq
 /locations
 /locations/[slug]
 /resources
 /resources/[slug]
```

### Location and Currency Personalization

TopMox supports soft public personalization for Nigeria, United States, Canada,
Australia, United Kingdom, Europe, and UAE.

Manual region selection is stored in the `topmox_region` cookie and always wins.
Cloudflare `CF-IPCountry` may be used as a soft country guess if the Hostinger
domain is proxied through Cloudflare. Browser timezone and `Accept-Language`
are weak fallbacks only. Unknown data falls back to Nigeria and NGN.

The app must not hard redirect by geography. Public currency display is for
parent clarity; payment amount and currency must still be derived server-side
from enrollment/plan data. Manual payment fallback remains available.

The homepage should use the resolved region to adjust parent-facing headline,
pain points, benefits, and payment/currency note. FAQ should not appear in the
main navigation menu, although `/faq` remains accessible.
