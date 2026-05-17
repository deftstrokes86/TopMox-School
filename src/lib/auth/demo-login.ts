import type { AppRole } from "./types";

export type DemoLoginAccount = {
  role: AppRole;
  label: "Admin" | "Tutor" | "Parent";
  email: string;
};

/**
 * Demo-only credentials used for local MVP walkthroughs.
 * Never use these as production credentials.
 */
export const DEMO_LOGIN_PASSWORD = "demo-only-change-me";

export const DEMO_LOGIN_ACCOUNTS: DemoLoginAccount[] = [
  {
    role: "ADMIN",
    label: "Admin",
    email: "admin@topmox.test"
  },
  {
    role: "TUTOR",
    label: "Tutor",
    email: "amara.math@topmox.test"
  },
  {
    role: "PARENT",
    label: "Parent",
    email: "ngozi.parent@topmox.test"
  }
];

export function parseDemoLoginEnabled(value: string | undefined): boolean {
  return value === "true";
}

export function isDemoLoginEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return parseDemoLoginEnabled(process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED);
}
