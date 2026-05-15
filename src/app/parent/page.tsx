import {
  ParentOnboardingStatePanel,
  type ParentDashboardPlanNextStep
} from "@/components/dashboard/ParentOnboardingStatePanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import type { AssessmentStatusValue } from "@/lib/utils/assessment-status";
import { getNextUpcomingLessonSummary } from "@/lib/utils/lesson-dashboard";
import type { LessonStatusValue } from "@/lib/utils/lesson-status";
import { getParentLessonVisibilitySummary } from "@/lib/utils/parent-lesson-visibility";
import { getParentReportDashboardSummary } from "@/lib/utils/parent-report-ui";
import { getCurrentParentAssessmentRequests } from "@/server/queries/assessment.queries";
import {
  getCurrentParentEnrollments,
  getEnrollmentByAssessmentForCurrentParent
} from "@/server/queries/enrollment.queries";
import { getCurrentParentHomework } from "@/server/queries/homework.queries";
import { getCurrentParentLessons } from "@/server/queries/lesson.queries";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";
import { getCurrentParentPayments } from "@/server/queries/payment.queries";
import { getCurrentParentReports } from "@/server/queries/report.queries";

export default async function ParentPlaceholderPage() {
  const user = await requireDashboardAccess("PARENT");
  const [
    onboardingStatus,
    assessments,
    enrollments,
    payments,
    lessons,
    homework,
    reports
  ] = await Promise.all([
    getParentOnboardingStatus(),
    getCurrentParentAssessmentRequests(),
    getCurrentParentEnrollments(),
    getCurrentParentPayments(),
    getCurrentParentLessons(),
    getCurrentParentHomework(),
    getCurrentParentReports()
  ]);
  const latestAssessment = assessments[0]
    ? {
        id: assessments[0].id,
        status: assessments[0].status as AssessmentStatusValue,
        childName: assessments[0].student.fullName,
        createdAt: assessments[0].createdAt.toISOString(),
        scheduledAt: assessments[0].scheduledAt?.toISOString() ?? null
      }
    : null;
  const latestRecommendedAssessment = assessments.find(
    (assessment) =>
      assessment.status === "PLAN_RECOMMENDED" &&
      assessment.outcome?.recommendedPlanId
  );
  const recommendationEnrollment = latestRecommendedAssessment
    ? await getEnrollmentByAssessmentForCurrentParent(latestRecommendedAssessment.id)
    : null;
  const activeEnrollment = enrollments.find(
    (enrollment) => enrollment.status === "ACTIVE"
  );
  const paymentUnderReview = payments.find(
    (payment) => payment.status === "AWAITING_VERIFICATION"
  );
  const pendingGatewayPayment = payments.find(
    (payment) => payment.status === "PENDING" && payment.checkoutUrl
  );
  const pendingEnrollment = enrollments.find(
    (enrollment) => enrollment.status === "PENDING_PAYMENT"
  );
  const nextLessonSummary = getNextUpcomingLessonSummary(lessons);
  const nextLesson = nextLessonSummary
    ? {
        id: nextLessonSummary.id,
        title: nextLessonSummary.title,
        childName: nextLessonSummary.childName,
        subjectName: nextLessonSummary.subjectName,
        startTime: nextLessonSummary.startTime.toISOString(),
        status: nextLessonSummary.status as LessonStatusValue,
        timezone: nextLessonSummary.timezone
      }
    : null;
  const lessonVisibilitySummary = getParentLessonVisibilitySummary(
    lessons,
    homework
  );
  const lessonVisibility = {
    recentLessonNote: lessonVisibilitySummary.recentLessonNote
      ? {
          ...lessonVisibilitySummary.recentLessonNote,
          startTime:
            lessonVisibilitySummary.recentLessonNote.startTime.toISOString()
        }
      : null,
    homeworkAssignedCount: lessonVisibilitySummary.homeworkAssignedCount,
    nextHomeworkDue: lessonVisibilitySummary.nextHomeworkDue
      ? {
          ...lessonVisibilitySummary.nextHomeworkDue,
          dueDate:
            lessonVisibilitySummary.nextHomeworkDue.dueDate?.toISOString() ??
            null
        }
      : null
  };
  const reportSummary = getParentReportDashboardSummary(reports);
  const reportVisibility = {
    latestReport: reportSummary.latestReport
      ? {
          id: reportSummary.latestReport.id,
          childName: reportSummary.latestReport.childName,
          tutorName: reportSummary.latestReport.tutorName,
          reportingMonth: reportSummary.latestReport.reportingMonth.toISOString(),
          publishedAt:
            reportSummary.latestReport.publishedAt?.toISOString() ?? null,
          progressLabel: reportSummary.latestReport.progress.label,
          progressTone: reportSummary.latestReport.progress.tone
        }
      : null,
    publishedReportCount: reportSummary.publishedReportCount
  };
  let planNextStep: ParentDashboardPlanNextStep | null = null;

  if (activeEnrollment) {
    planNextStep = {
      title: "Plan active",
      description: "Plan active. Lessons will appear after scheduling.",
      badgeLabel: "Active",
      badgeTone: "success",
      ctaLabel: "View Lessons",
      ctaHref: "/parent/lessons"
    };
  } else if (paymentUnderReview) {
    planNextStep = {
      title: "Payment under review",
      description:
        "Payment under review. TopMox will verify the submitted details before activating the tutoring plan.",
      badgeLabel: "Awaiting verification",
      badgeTone: "warning",
      ctaLabel: "View Payment",
      ctaHref: `/parent/payments/${paymentUnderReview.id}`
    };
  } else if (pendingGatewayPayment) {
    planNextStep = {
      title: "Continue Flutterwave checkout",
      description:
        "Flutterwave checkout has started. Complete checkout so TopMox can verify payment and activate the plan.",
      badgeLabel: "Checkout pending",
      badgeTone: "info",
      ctaLabel: "Continue Checkout",
      ctaHref: `/parent/payments/${pendingGatewayPayment.id}`
    };
  } else if (pendingEnrollment) {
    planNextStep = {
      title: "Choose payment method",
      description:
        "Your recommended plan has been accepted. Choose Flutterwave checkout or manual transfer details as the next step.",
      badgeLabel: "Pending payment",
      badgeTone: "warning",
      ctaLabel: "Choose Payment Method",
      ctaHref: `/parent/payments/new?enrollmentId=${pendingEnrollment.id}`
    };
  } else if (latestRecommendedAssessment && !recommendationEnrollment) {
    planNextStep = {
      title: "Recommendation ready",
      description:
        "TopMox has prepared a recommended tutoring plan. Review and accept it when you are ready.",
      badgeLabel: "Plan recommended",
      badgeTone: "success",
      ctaLabel: "Accept Recommended Plan",
      ctaHref: `/parent/assessments/${latestRecommendedAssessment.id}`
    };
  }

  return (
    <ParentOnboardingStatePanel
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      initialState={onboardingStatus}
      latestAssessment={latestAssessment}
      nextLesson={nextLesson}
      lessonVisibility={lessonVisibility}
      reportVisibility={reportVisibility}
      planNextStep={planNextStep}
    />
  );
}
