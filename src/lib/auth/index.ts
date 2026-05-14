export {
  canAccessAssessment,
  canAccessLesson,
  canAccessPayment,
  canAccessReport,
  canAccessStudent
} from "./access-control";
export { authOptions } from "./auth-options";
export { getDashboardRedirectPath, requireDashboardAccess } from "./dashboard-access";
export {
  DEMO_LOGIN_ACCOUNTS,
  DEMO_LOGIN_PASSWORD,
  isDemoLoginEnabled,
  parseDemoLoginEnabled
} from "./demo-login";
export { getDashboardPathForRole } from "./role";
export {
  AuthError,
  getCurrentUser,
  requireAdmin,
  requireAuth,
  requireParent,
  requireRole,
  requireTutor
} from "./session";
export type { AppRole, AuthUser } from "./types";
export { APP_ROLES, isAppRole } from "./types";
