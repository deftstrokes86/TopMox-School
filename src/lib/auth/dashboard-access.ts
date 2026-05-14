import { redirect } from "next/navigation";

import { getDashboardPathForRole } from "./role";
import { getCurrentUser } from "./session";
import type { AppRole, AuthUser } from "./types";

/**
 * Enforces protected dashboard route access server-side.
 * - Unauthenticated users are redirected to /login.
 * - Authenticated users with the wrong role are redirected to their role dashboard.
 */
export async function requireDashboardAccess(role: AppRole): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    redirect(getDashboardPathForRole(user.role));
  }

  return user;
}
