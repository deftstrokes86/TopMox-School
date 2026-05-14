export const APP_ROLES = ["ADMIN", "TUTOR", "PARENT"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
};

export const isAppRole = (value: unknown): value is AppRole => {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
};
