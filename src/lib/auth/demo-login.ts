import type { AppRole } from "./types";

export type DemoLoginAccount = {
  role: AppRole;
  label: "Admin" | "Tutor" | "Parent";
  email: string;
  name: string;
  walkthrough: string;
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
    email: "admin@topmox.test",
    name: "TopMox Admin",
    walkthrough: "Operations dashboard, assessments, payments, lessons, reports"
  },
  {
    role: "TUTOR",
    label: "Tutor",
    email: "amara.math@topmox.test",
    name: "Amara Okoye",
    walkthrough: "Mathematics and Science tutor workflow"
  },
  {
    role: "TUTOR",
    label: "Tutor",
    email: "david.english@topmox.test",
    name: "David Mensah",
    walkthrough: "English and Reading tutor workflow"
  },
  {
    role: "PARENT",
    label: "Parent",
    email: "ngozi.parent@topmox.test",
    name: "Ngozi Akinyemi",
    walkthrough: "Nigeria parent with active plan, lessons, homework, and report"
  },
  {
    role: "PARENT",
    label: "Parent",
    email: "bola.ukparent@topmox.test",
    name: "Bola Okafor",
    walkthrough: "UK parent with scheduled assessment and pending payment review"
  },
  {
    role: "PARENT",
    label: "Parent",
    email: "ada.canadaparent@topmox.test",
    name: "Ada Mensah",
    walkthrough: "Canada parent with Flutterwave payment and exam-prep history"
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
