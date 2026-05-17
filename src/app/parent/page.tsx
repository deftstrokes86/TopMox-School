import { ParentDashboardView } from "@/components/dashboard/RoleDashboardViews";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { getCurrentParentDashboardDataForUser } from "@/server/queries/dashboard.queries";

export const dynamic = "force-dynamic";

export default async function ParentDashboardPage() {
  const user = await requireDashboardAccess("PARENT");
  const data = await getCurrentParentDashboardDataForUser(user);

  return <ParentDashboardView data={data} />;
}
