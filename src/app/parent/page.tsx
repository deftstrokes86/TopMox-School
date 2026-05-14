import { DashboardPlaceholderPanel } from "@/components/dashboard/DashboardPlaceholderPanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

export default async function ParentPlaceholderPage() {
  const user = await requireDashboardAccess("PARENT");

  return (
    <DashboardPlaceholderPanel
      title="Parent Dashboard"
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      message="Your parent dashboard will show your child profiles, assessments, lessons, homework, payments, and progress reports."
    />
  );
}
