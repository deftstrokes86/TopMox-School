import { ParentOnboardingStatePanel } from "@/components/dashboard/ParentOnboardingStatePanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";

export default async function ParentPlaceholderPage() {
  const user = await requireDashboardAccess("PARENT");
  const onboardingStatus = await getParentOnboardingStatus();

  return (
    <ParentOnboardingStatePanel
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      initialState={onboardingStatus}
    />
  );
}
