import { TutorDashboardView } from "@/components/dashboard/RoleDashboardViews";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { getCurrentTutorDashboardDataForUser } from "@/server/queries/dashboard.queries";

export const dynamic = "force-dynamic";

export default async function TutorDashboardPage() {
  const user = await requireDashboardAccess("TUTOR");
  const data = await getCurrentTutorDashboardDataForUser(user);

  return <TutorDashboardView data={data} />;
}
