export type NavigationItem = {
  label: string;
  href: string;
};

export const PUBLIC_NAV_ITEMS: NavigationItem[] = [
  { label: "Global Tutoring", href: "/global-tutoring" },
  { label: "Subjects", href: "/subjects" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "FAQ", href: "/faq" }
];

export const PARENT_NAV_ITEMS: NavigationItem[] = [
  { label: "Overview", href: "/parent" },
  { label: "Children", href: "/parent/children" },
  { label: "Assessments", href: "/parent/assessments" },
  { label: "Lessons", href: "/parent/lessons" },
  { label: "Reports", href: "/parent/reports" }
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
  { label: "Assessments", href: "/admin/assessments" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Lessons", href: "/admin/lessons" },
  { label: "Resources", href: "/admin/resources" }
];
