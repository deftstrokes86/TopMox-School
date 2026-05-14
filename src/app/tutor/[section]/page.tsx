import { notFound } from "next/navigation";

import { DashboardPlaceholderPanel } from "@/components/dashboard/DashboardPlaceholderPanel";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

const TUTOR_SECTION_COPY: Record<string, { title: string; message: string }> = {
  lessons: {
    title: "Lessons",
    message:
      "Assigned lessons, attendance marking, lesson notes, and status updates will be implemented in upcoming phases."
  },
  students: {
    title: "Students",
    message:
      "Assigned student snapshots, academic concerns, and communication context will be implemented in upcoming phases."
  },
  homework: {
    title: "Homework",
    message:
      "Homework assignment, due date tracking, and completion status workflows will be implemented in upcoming phases."
  },
  reports: {
    title: "Reports",
    message:
      "Progress report drafting, review handoff, and publishing preparation workflows will be implemented in upcoming phases."
  }
};

type TutorSectionPageProps = {
  params: {
    section: string;
  };
};

export default async function TutorSectionPage({ params }: TutorSectionPageProps) {
  const section = TUTOR_SECTION_COPY[params.section];

  if (!section) {
    notFound();
  }

  const user = await requireDashboardAccess("TUTOR");

  return (
    <DashboardPlaceholderPanel
      title={`Tutor: ${section.title}`}
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      message={section.message}
    />
  );
}
