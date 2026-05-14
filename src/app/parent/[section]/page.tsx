import { notFound } from "next/navigation";

import { DashboardPlaceholderPanel } from "@/components/dashboard/DashboardPlaceholderPanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

const PARENT_SECTION_COPY: Record<string, { title: string; message: string }> = {
  onboarding: {
    title: "Onboarding",
    message:
      "Parent onboarding steps, profile completion, and readiness tracking will be implemented in upcoming phases."
  },
  children: {
    title: "Children",
    message:
      "Child profile creation, curriculum details, and subject support preferences will be implemented in upcoming phases."
  },
  assessments: {
    title: "Assessments",
    message:
      "Assessment request submission, scheduling visibility, and recommendation outcomes will be implemented in upcoming phases."
  },
  lessons: {
    title: "Lessons",
    message:
      "Upcoming lessons, attendance summaries, and lesson history views will be implemented in upcoming phases."
  },
  payments: {
    title: "Payments",
    message:
      "Manual payment tracking, verification status, and enrollment linkage will be implemented in upcoming phases."
  },
  reports: {
    title: "Reports",
    message:
      "Published progress reports, academic summaries, and parent action points will be implemented in upcoming phases."
  },
  support: {
    title: "Support",
    message:
      "Support request creation, status tracking, and response history will be implemented in upcoming phases."
  }
};

type ParentSectionPageProps = {
  params: {
    section: string;
  };
};

export default async function ParentSectionPage({ params }: ParentSectionPageProps) {
  const section = PARENT_SECTION_COPY[params.section];

  if (!section) {
    notFound();
  }

  const user = await requireDashboardAccess("PARENT");

  return (
    <DashboardPlaceholderPanel
      title={`Parent: ${section.title}`}
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      message={section.message}
    />
  );
}
