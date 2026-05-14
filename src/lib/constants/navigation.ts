export type NavigationItem = {
  label: string;
  href: string;
};

export const PUBLIC_NAV_ITEMS: NavigationItem[] = [
  { label: "Global Tutoring", href: "/global-tutoring" },
  { label: "Subjects", href: "/subjects" },
  { label: "Exam Prep", href: "/exam-prep" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "FAQ", href: "/faq" }
];

export const PARENT_NAV_ITEMS: NavigationItem[] = [
  { label: "Overview", href: "/parent" },
  { label: "Onboarding", href: "/parent/onboarding" },
  { label: "Children", href: "/parent/children" },
  { label: "Assessments", href: "/parent/assessments" },
  { label: "Lessons", href: "/parent/lessons" },
  { label: "Payments", href: "/parent/payments" },
  { label: "Reports", href: "/parent/reports" },
  { label: "Support", href: "/parent/support" }
];

export const TUTOR_NAV_ITEMS: NavigationItem[] = [
  { label: "Overview", href: "/tutor" },
  { label: "Lessons", href: "/tutor/lessons" },
  { label: "Students", href: "/tutor/students" },
  { label: "Homework", href: "/tutor/homework" },
  { label: "Reports", href: "/tutor/reports" }
];

export const ADMIN_NAV_ITEMS: NavigationItem[] = [
  { label: "Overview", href: "/admin" },
  { label: "Parents", href: "/admin/parents" },
  { label: "Students", href: "/admin/students" },
  { label: "Tutors", href: "/admin/tutors" },
  { label: "Assessments", href: "/admin/assessments" },
  { label: "Lessons", href: "/admin/lessons" },
  { label: "Plans", href: "/admin/plans" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Support", href: "/admin/support" },
  { label: "Resources", href: "/admin/resources" },
  { label: "Settings", href: "/admin/settings" }
];
