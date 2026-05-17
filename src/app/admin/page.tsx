import { AdminDashboardView } from "@/components/dashboard/RoleDashboardViews";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { getAdminDashboardDataForUser } from "@/server/queries/dashboard.queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireDashboardAccess("ADMIN");
  const data = await getAdminDashboardDataForUser(user);

  return <AdminDashboardView data={data} />;
}
