import type { AppRole } from "./types";

export function getDashboardPathForRole(role: AppRole | string | null | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TUTOR":
      return "/tutor";
    case "PARENT":
      return "/parent";
    default:
      return "/login";
  }
}
