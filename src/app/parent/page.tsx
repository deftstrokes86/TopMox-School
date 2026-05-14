import { ParentOnboardingStatePanel } from "@/components/dashboard/ParentOnboardingStatePanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

export default async function ParentPlaceholderPage() {
  const user = await requireDashboardAccess("PARENT");

  return (
    <ParentOnboardingStatePanel
      role={user.role}
      userName={user.name}
      userEmail={user.email}
    />
  );
}
