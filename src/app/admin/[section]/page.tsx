import { notFound } from "next/navigation";

import { DashboardPlaceholderPanel } from "@/components/dashboard/DashboardPlaceholderPanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

const ADMIN_SECTION_COPY: Record<string, { title: string; message: string }> = {
  parents: {
    title: "Parents",
    message:
      "Parent account management, contact history, and support visibility will be implemented in upcoming phases."
  },
  students: {
    title: "Students",
    message:
      "Student profile management, academic summaries, and assignment flows will be implemented in upcoming phases."
  },
  tutors: {
    title: "Tutors",
    message:
      "Tutor provisioning, status tracking, and workload management will be implemented in upcoming phases."
  },
  assessments: {
    title: "Assessments",
    message:
      "Assessment review, scheduling, outcomes, and plan recommendation workflows will be implemented in upcoming phases."
  },
  lessons: {
    title: "Lessons",
    message:
      "Lesson scheduling, reassignment, and operational monitoring workflows will be implemented in upcoming phases."
  },
  plans: {
    title: "Plans",
    message:
      "Tutoring plan creation, pricing controls, and recommendation logic will be implemented in upcoming phases."
  },
  payments: {
    title: "Payments",
    message:
      "Manual payment verification, status updates, and enrollment activation workflows will be implemented in upcoming phases."
  },
  reports: {
    title: "Reports",
    message:
      "Progress report review, publishing, and retention visibility workflows will be implemented in upcoming phases."
  },
  support: {
    title: "Support",
    message:
      "Parent support queue management, response tracking, and issue resolution workflows will be implemented in upcoming phases."
  },
  resources: {
    title: "Resources",
    message:
      "Resource publishing, category management, and SEO content workflows will be implemented in upcoming phases."
  },
  settings: {
    title: "Settings",
    message:
      "Operational configuration, account preferences, and system controls will be implemented in upcoming phases."
  }
};

type AdminSectionPageProps = {
  params: {
    section: string;
  };
};

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  const section = ADMIN_SECTION_COPY[params.section];

  if (!section) {
    notFound();
  }

  const user = await requireDashboardAccess("ADMIN");

  return (
    <DashboardPlaceholderPanel
      title={`Admin: ${section.title}`}
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      message={section.message}
    />
  );
}
