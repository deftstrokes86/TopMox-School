import { isAppRole, type AppRole } from "./types";

export type DemoLoginAccount = {
  role: AppRole;
  label: "Admin" | "Tutor" | "Parent";
  email: string;
  name: string;
  walkthrough: string;
};

export const DEMO_LOGIN_UNAVAILABLE_MESSAGE =
  "Demo login is currently unavailable. Please check demo configuration and seeded accounts.";

const DEMO_LOGIN_ACCOUNT_BY_ROLE: Record<AppRole, DemoLoginAccount> = {
  ADMIN: {
    role: "ADMIN",
    label: "Admin",
    email: "admin@topmox.test",
    name: "TopMox Admin",
    walkthrough: "Operations dashboard, assessments, payments, lessons, reports"
  },
  TUTOR: {
    role: "TUTOR",
    label: "Tutor",
    email: "tutor@topmox.test",
    name: "Amara Okoye",
    walkthrough: "Mathematics and Science tutor workflow"
  },
  PARENT: {
    role: "PARENT",
    label: "Parent",
    email: "parent@topmox.test",
    name: "Ngozi Akinyemi",
    walkthrough: "Nigeria parent with active plan, lessons, homework, and report"
  }
};

export const DEMO_LOGIN_ACCOUNTS: DemoLoginAccount[] = [
  DEMO_LOGIN_ACCOUNT_BY_ROLE.ADMIN,
  DEMO_LOGIN_ACCOUNT_BY_ROLE.PARENT,
  DEMO_LOGIN_ACCOUNT_BY_ROLE.TUTOR
];

export function parseDemoLoginEnabled(value: string | undefined): boolean {
  return value === "true";
}

export function isDemoLoginVisible(): boolean {
  return parseDemoLoginEnabled(process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED);
}

export function getDemoLoginAccountForRole(role: unknown): DemoLoginAccount | null {
  if (!isAppRole(role)) {
    return null;
  }

  return DEMO_LOGIN_ACCOUNT_BY_ROLE[role] ?? null;
}
