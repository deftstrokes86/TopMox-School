export {
  canAccessAssessment,
  canAccessLesson,
  canAccessPayment,
  canAccessReport,
  canAccessStudent
} from "./access-control";
export { authOptions } from "./auth-options";
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
