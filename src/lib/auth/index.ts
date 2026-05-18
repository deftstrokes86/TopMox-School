export {
  canAccessAssessment,
  canAccessEnrollment,
  canAccessLesson,
  canAccessPayment,
  canAccessReport,
  canAccessSupportRequest,
  canAccessStudent
} from "./access-control";
export { authOptions } from "./auth-options";
export { getDashboardRedirectPath, requireDashboardAccess } from "./dashboard-access";
export {
  DEMO_LOGIN_ACCOUNTS,
  DEMO_LOGIN_UNAVAILABLE_MESSAGE,
  getDemoLoginAccountForRole,
  isDemoLoginVisible,
  parseDemoLoginEnabled
} from "./demo-login";
export {
  authorizeDemoLogin,
  isDemoLoginServerEnabled
} from "./demo-login.server";
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
