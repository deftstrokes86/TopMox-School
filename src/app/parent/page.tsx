import {
  ParentOnboardingStatePanel,
  type ParentDashboardPlanNextStep
} from "@/components/dashboard/ParentOnboardingStatePanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import type { AssessmentStatusValue } from "@/lib/utils/assessment-status";
import { getCurrentParentAssessmentRequests } from "@/server/queries/assessment.queries";
import {
  getCurrentParentEnrollments,
  getEnrollmentByAssessmentForCurrentParent
} from "@/server/queries/enrollment.queries";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";
import { getCurrentParentPayments } from "@/server/queries/payment.queries";

export default async function ParentPlaceholderPage() {
  const user = await requireDashboardAccess("PARENT");
  const [onboardingStatus, assessments, enrollments, payments] = await Promise.all([
    getParentOnboardingStatus(),
    getCurrentParentAssessmentRequests(),
    getCurrentParentEnrollments(),
    getCurrentParentPayments()
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
  const pendingEnrollment = enrollments.find(
    (enrollment) => enrollment.status === "PENDING_PAYMENT"
  );
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
  } else if (pendingEnrollment) {
    planNextStep = {
      title: "Submit payment details",
      description:
        "Your recommended plan has been accepted. Submit payment details so TopMox can verify and activate tutoring.",
      badgeLabel: "Pending payment",
      badgeTone: "warning",
      ctaLabel: "Submit Payment",
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
      planNextStep={planNextStep}
    />
  );
}
