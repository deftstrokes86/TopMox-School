import { ParentOnboardingStatePanel } from "@/components/dashboard/ParentOnboardingStatePanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import type { AssessmentStatusValue } from "@/lib/utils/assessment-status";
import { getCurrentParentAssessmentRequests } from "@/server/queries/assessment.queries";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";

export default async function ParentPlaceholderPage() {
  const user = await requireDashboardAccess("PARENT");
  const [onboardingStatus, assessments] = await Promise.all([
    getParentOnboardingStatus(),
    getCurrentParentAssessmentRequests()
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

  return (
    <ParentOnboardingStatePanel
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      initialState={onboardingStatus}
      latestAssessment={latestAssessment}
    />
  );
}
