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
  const redirectPath = getDashboardRedirectPath(role, user);

  if (redirectPath) {
    redirect(redirectPath);
  }

  return user as AuthUser;
}

/**
 * Pure helper exposed for unit tests and shared guard logic.
 */
export function getDashboardRedirectPath(
  requiredRole: AppRole,
  user: AuthUser | null
): string | null {
  if (!user) {
    return "/login";
  }

  if (user.role !== requiredRole) {
    return getDashboardPathForRole(user.role);
  }

  return null;
}
