import { DashboardPlaceholderPanel } from "@/components/dashboard/DashboardPlaceholderPanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

export default async function AdminPlaceholderPage() {
  const user = await requireDashboardAccess("ADMIN");

  return (
    <DashboardPlaceholderPanel
      title="Admin Dashboard"
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      message="TopMox operations dashboard will manage assessments, parents, tutors, lessons, payments, reports, and revenue visibility."
    />
  );
}
