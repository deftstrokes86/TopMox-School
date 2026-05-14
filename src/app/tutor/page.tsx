import { DashboardPlaceholderPanel } from "@/components/dashboard/DashboardPlaceholderPanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

export default async function TutorPlaceholderPage() {
  const user = await requireDashboardAccess("TUTOR");

  return (
    <DashboardPlaceholderPanel
      title="Tutor Dashboard"
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      message="Your tutor dashboard will show assigned students, upcoming lessons, lesson notes, homework, and progress reports."
    />
  );
}
