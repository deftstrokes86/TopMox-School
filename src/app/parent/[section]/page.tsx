import { notFound } from "next/navigation";

import { DashboardPlaceholderPanel } from "@/components/dashboard/DashboardPlaceholderPanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

const PARENT_SECTION_COPY: Record<string, { title: string; message: string }> = {
  onboarding: {
    title: "Onboarding",
    message:
      "Your guided parent onboarding path is available from the dedicated onboarding page."
  },
  children: {
    title: "Children",
    message:
      "Your child profiles are available from the dedicated children page."
  },
  assessments: {
    title: "Assessments",
    message:
      "After child profiles are ready, this area will show assessment requests, schedules, and recommendations."
  },
  lessons: {
    title: "Lessons",
    message:
      "Once an enrollment is active, this area will show upcoming lessons, attendance, and lesson history."
  },
  payments: {
    title: "Payments",
    message:
      "Payment records and verification status will appear here after a tutoring plan is recommended."
  },
  reports: {
    title: "Reports",
    message:
      "Published progress reports will appear here once lessons and reporting are connected."
  },
  support: {
    title: "Support",
    message:
      "Support requests and response history will appear here once parent support workflows are connected."
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
