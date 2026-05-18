import Link from "next/link";
import React from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Headphones,
  Users
} from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { StatusTone } from "@/lib/constants/statuses";
import type { ActivityFeedItem } from "@/lib/utils/activity-feed";

type DashboardRole = "ADMIN" | "PARENT" | "TUTOR";
type AmountValue = unknown;

type DashboardUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: DashboardRole | string;
};

type NamedRecord = {
  id?: string;
  name?: string;
  fullName?: string;
};

type StudentSummary = NamedRecord & {
  age?: number;
  classYearGroup?: string;
  countryOfStudy?: string;
  curriculum?: string;
  mainAcademicChallenge?: string;
  academicGoal?: string | null;
  subjects?: NamedRecord[];
};

type DashboardLesson = {
  id: string;
  title?: string;
  startTime?: Date;
  timezone?: string | null;
  status?: string;
  meetingLink?: string | null;
  student?: StudentSummary | null;
  tutor?: {
    user?: {
      name?: string | null;
    } | null;
  } | null;
  subject?: NamedRecord | null;
};

type AdminDashboardData = {
  user: DashboardUser;
  stats: {
    totalParents: number;
    totalStudents: number;
    activeEnrollments: number;
    pendingAssessments: number;
    paymentsAwaitingVerification: number;
    paidPayments: number;
    upcomingLessons: number;
    completedLessons: number;
    openSupportRequests: number;
    reportsInReview: number;
    activeTutors: number;
  };
  revenue: {
    totalPaidRevenue: number;
    paidPaymentCount: number;
    revenueByCurrency: Array<{
      currency: string;
      amount: string;
      paidPayments: number;
    }>;
    recentPaidPayments: Array<{
      id: string;
      amount: string;
      currency: string;
      parentName: string;
      childName: string;
      planName: string;
      paidAt?: Date | null;
    }>;
  };
  conversionFunnel: {
    assessmentRequests: number;
    scheduledAssessments: number;
    completedAssessments: number;
    planRecommended: number;
    convertedAssessments: number;
    activeEnrollments: number;
  };
  recentAssessmentRequests: Array<{
    id: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    student?: StudentSummary | null;
    parent?: {
      user?: {
        name?: string | null;
        email?: string | null;
      } | null;
    } | null;
  }>;
  recentPayments: Array<{
    id: string;
    status: string;
    amount?: AmountValue;
    currency?: string | null;
    paymentMethod?: string | null;
    createdAt?: Date;
    parent?: {
      user?: {
        name?: string | null;
        email?: string | null;
      } | null;
    } | null;
    student?: StudentSummary | null;
    enrollment?: {
      student?: StudentSummary | null;
      tutoringPlan?: NamedRecord | null;
    } | null;
  }>;
  upcomingLessons: DashboardLesson[];
  openSupportRequests: Array<{
    id: string;
    subject: string;
    status: string;
    createdAt?: Date;
    parent?: {
      user?: {
        name?: string | null;
        email?: string | null;
      } | null;
    } | null;
    student?: StudentSummary | null;
  }>;
  reportsAwaitingReview: Array<{
    id: string;
    title?: string;
    status: string;
    reportingMonth?: Date;
    createdAt?: Date;
    student?: StudentSummary | null;
    tutor?: {
      user?: {
        name?: string | null;
      } | null;
    } | null;
  }>;
  tutorWorkload: Array<{
    tutorId: string;
    tutorName: string;
    status: string;
    assignedEnrollments: number;
    lessons: number;
    homeworkAssigned: number;
    reports: number;
  }>;
  recentActivity: ActivityFeedItem[];
};

type ParentDashboardData = {
  user: DashboardUser;
  parentProfileStatus: {
    hasParentProfile: boolean;
    hasChildren: boolean;
    childrenCount: number;
    isComplete: boolean;
  };
  parentProfile: {
    id: string;
    country?: string | null;
    timezone?: string | null;
    preferredContactMethod?: string | null;
  } | null;
  childProfiles: StudentSummary[];
  latestAssessment: {
    id: string;
    status: string;
    student?: StudentSummary | null;
  } | null;
  recommendedPlan: {
    id?: string;
    name?: string;
    currency?: string;
    monthlyPrice?: AmountValue;
    sessionsPerWeek?: number;
    bestFor?: string | null;
  } | null;
  enrollments: Array<{
    id: string;
    status: string;
    student?: StudentSummary | null;
    tutoringPlan?: NamedRecord | null;
  }>;
  activeEnrollment: {
    id: string;
    status: string;
    student?: StudentSummary | null;
    tutoringPlan?: NamedRecord | null;
  } | null;
  paymentStatusSummary: {
    pending: number;
    awaitingVerification: number;
    paid: number;
    failed: number;
  };
  nextUpcomingLesson: DashboardLesson | null;
  recentCompletedLessonNote: DashboardLesson | null;
  homeworkDue: Array<{
    id: string;
    title: string;
    dueDate?: Date | null;
    status: string;
    student?: StudentSummary | null;
  }>;
  latestPublishedReport: {
    id: string;
    title?: string;
    reportingMonth?: Date;
    overallProgressStatus?: string | null;
    publishedAt?: Date | null;
    student?: StudentSummary | null;
  } | null;
  openSupportRequests: Array<{
    id: string;
    subject: string;
    status: string;
    updatedAt?: Date;
  }>;
  notificationsSummary: {
    unreadCount: number;
    recent: unknown[];
  };
  recentActivity: ActivityFeedItem[];
};

type TutorDashboardData = {
  user: DashboardUser;
  tutorProfile: {
    id: string;
    status: string;
    subjects?: NamedRecord[];
  } | null;
  todayLessons: DashboardLesson[];
  upcomingLessons: DashboardLesson[];
  lessonsNeedingNotes: DashboardLesson[];
  assignedStudents: Array<
    StudentSummary & {
      enrollmentId?: string;
      planName?: string;
    }
  >;
  homeworkAssigned: Array<{
    id: string;
    title: string;
    dueDate?: Date | null;
    status: string;
    student?: StudentSummary | null;
  }>;
  reports: {
    draft: Array<{
      id: string;
      reportingMonth?: Date;
      student?: StudentSummary | null;
    }>;
    inReview: Array<{
      id: string;
      reportingMonth?: Date;
      student?: StudentSummary | null;
    }>;
    published: unknown[];
    due: unknown[];
  };
  notificationsSummary: {
    unreadCount: number;
    recent: unknown[];
  };
  recentActivity: ActivityFeedItem[];
};

function RoleMismatchState({ expectedRole }: { expectedRole: DashboardRole }) {
  return (
    <EmptyState
      title="Dashboard unavailable"
      description={`This dashboard requires a ${expectedRole.toLowerCase()} account. Please use the workspace assigned to your role.`}
    />
  );
}

function amountToString(value: AmountValue): string {
  if (value === null || value === undefined) {
    return "0";
  }

  if (typeof value === "object" && "toString" in value) {
    return value.toString();
  }

  return String(value);
}

function formatAmount(currency?: string | null, amount?: AmountValue): string {
  return `${currency ?? "NGN"} ${amountToString(amount)}`;
}

function formatDate(value?: Date | null): string {
  if (!value) {
    return "Not dated";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

function formatDateTime(value?: Date | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function humanize(value?: string | null): string {
  if (!value) {
    return "Not set";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function toneForStatus(status?: string | null): StatusTone {
  if (!status) {
    return "neutral";
  }

  if (["ACTIVE", "PAID", "COMPLETED", "PUBLISHED", "CONVERTED"].includes(status)) {
    return "success";
  }

  if (
    [
      "PENDING",
      "PENDING_PAYMENT",
      "PENDING_REVIEW",
      "AWAITING_VERIFICATION",
      "REVIEW",
      "OPEN",
      "IN_REVIEW",
      "SCHEDULED",
      "RESCHEDULED"
    ].includes(status)
  ) {
    return "warning";
  }

  if (["FAILED", "DECLINED", "CANCELLED"].includes(status)) {
    return "danger";
  }

  return "neutral";
}

function SectionCard({
  title,
  description,
  href,
  hrefLabel,
  children
}: {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-royal-blue/20 shadow-soft">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl text-deep-navy">{title}</CardTitle>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {href ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={href}>
              {hrefLabel ?? "View"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CompactList({
  emptyTitle,
  emptyDescription,
  children
}: {
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode[];
}) {
  const visibleChildren = children.filter(Boolean);

  if (visibleChildren.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <div className="space-y-3">{visibleChildren}</div>;
}

function DashboardListItem({
  title,
  description,
  status,
  href
}: {
  title: string;
  description: string;
  status?: string | null;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-soft-cream/35 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-semibold text-deep-navy">{title}</p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      {status ? (
        <StatusBadge label={humanize(status)} tone={toneForStatus(status)} />
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

export function AdminDashboardView({ data }: { data: AdminDashboardData }) {
  if (data.user.role !== "ADMIN") {
    return <RoleMismatchState expectedRole="ADMIN" />;
  }

  const funnelItems = [
    ["Assessment requests", data.conversionFunnel.assessmentRequests],
    ["Scheduled", data.conversionFunnel.scheduledAssessments],
    ["Completed", data.conversionFunnel.completedAssessments],
    ["Plan recommended", data.conversionFunnel.planRecommended],
    ["Converted", data.conversionFunnel.convertedAssessments],
    ["Active enrollments", data.conversionFunnel.activeEnrollments]
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="A calm operational view of TopMox assessments, payments, lessons, reports, support, and tutor workload."
        actions={
          <>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/admin/assessments">View assessments</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/payments">View payments</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/lessons">View lessons</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/reports">View reports</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/support">View support</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Parents"
          value={String(data.stats.totalParents)}
          context="Registered parent accounts."
          icon={<Users className="h-5 w-5 text-royal-blue" />}
        />
        <StatCard
          label="Students"
          value={String(data.stats.totalStudents)}
          context="Child learning profiles."
          icon={<BookOpenCheck className="h-5 w-5 text-royal-blue" />}
        />
        <StatCard
          label="Active enrollments"
          value={String(data.stats.activeEnrollments)}
          context="Tutoring plans currently active."
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
        />
        <StatCard
          label="Pending assessments"
          value={String(data.stats.pendingAssessments)}
          context="Requests awaiting TopMox review."
          icon={<ClipboardList className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Payments awaiting verification"
          value={String(data.stats.paymentsAwaitingVerification)}
          context="Manual payments awaiting admin review."
          icon={<CreditCard className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Upcoming lessons"
          value={String(data.stats.upcomingLessons)}
          context="Scheduled future lessons."
          icon={<CalendarClock className="h-5 w-5 text-info" />}
        />
        <StatCard
          label="Reports in review"
          value={String(data.stats.reportsInReview)}
          context="Tutor reports waiting for publishing."
          icon={<FileText className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Open support requests"
          value={String(data.stats.openSupportRequests)}
          context="Parent requests needing attention."
          icon={<Headphones className="h-5 w-5 text-royal-blue" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Payment Summary"
          description="Paid revenue by currency and recent paid payments only."
          href="/admin/payments"
          hrefLabel="View payments"
        >
          {data.revenue.revenueByCurrency.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.revenue.revenueByCurrency.map((row) => (
                <div
                  key={row.currency}
                  className="rounded-xl border border-border/80 bg-white p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                    {row.currency}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-deep-navy">
                    {row.currency} {row.amount}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {row.paidPayments} paid payment
                    {row.paidPayments === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No paid revenue yet"
              description="Paid payments will appear here after verified payment activation."
            />
          )}
          <div className="mt-4 space-y-3">
            {data.revenue.recentPaidPayments.map((payment) => (
              <DashboardListItem
                key={payment.id}
                title={`${payment.currency} ${payment.amount}`}
                description={`${payment.parentName} | ${payment.childName} | ${payment.planName} | ${formatDate(payment.paidAt)}`}
                href={`/admin/payments/${payment.id}`}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Conversion Funnel"
          description="A simple assessment-to-active-enrollment snapshot."
        >
          {funnelItems.some(([, value]) => Number(value) > 0) ? (
            <div className="space-y-3">
              {funnelItems.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-soft-cream/35 p-4"
                >
                  <span className="font-medium text-deep-navy">{label}</span>
                  <span className="text-xl font-semibold text-royal-blue">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No conversion data yet"
              description="Assessment and enrollment counts will appear as families move through the TopMox journey."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Assessment Requests"
        description="Latest parent submissions and assessment workflow changes."
        href="/admin/assessments"
        hrefLabel="View assessments"
      >
        <CompactList
          emptyTitle="No assessment requests yet"
          emptyDescription="New parent assessment requests will appear here."
        >
          {data.recentAssessmentRequests.map((assessment) => (
            <DashboardListItem
              key={assessment.id}
              title={assessment.student?.fullName ?? "Child not linked"}
              description={`Parent: ${assessment.parent?.user?.name ?? "Parent not linked"} | Submitted: ${formatDate(assessment.createdAt)}`}
              status={assessment.status}
              href={`/admin/assessments/${assessment.id}`}
            />
          ))}
        </CompactList>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Upcoming Lessons"
          description="Scheduled lessons that parents and tutors can see."
          href="/admin/lessons"
          hrefLabel="View lessons"
        >
          <CompactList
            emptyTitle="No upcoming lessons"
            emptyDescription="Scheduled lessons will appear here after active enrollments are assigned."
          >
            {data.upcomingLessons.map((lesson) => (
              <DashboardListItem
                key={lesson.id}
                title={lesson.title ?? "Lesson"}
                description={`${lesson.student?.fullName ?? "Child"} | ${lesson.subject?.name ?? "Subject"} | ${formatDateTime(lesson.startTime)}${lesson.timezone ? ` | ${lesson.timezone}` : ""}`}
                status={lesson.status}
                href={`/admin/lessons/${lesson.id}`}
              />
            ))}
          </CompactList>
        </SectionCard>

        <SectionCard
          title="Open Support Requests"
          description="Parent questions and issues needing operational follow-through."
          href="/admin/support"
          hrefLabel="View support"
        >
          <CompactList
            emptyTitle="No open support requests"
            emptyDescription="Open parent support requests will appear here."
          >
            {data.openSupportRequests.map((support) => (
              <DashboardListItem
                key={support.id}
                title={support.subject}
                description={`Parent: ${support.parent?.user?.name ?? "Parent not linked"} | Child: ${support.student?.fullName ?? "Not linked"}`}
                status={support.status}
                href={`/admin/support/${support.id}`}
              />
            ))}
          </CompactList>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Recent Payment Submissions"
          description="Latest payment records and verification state."
          href="/admin/payments"
          hrefLabel="View payments"
        >
          <CompactList
            emptyTitle="No payment submissions yet"
            emptyDescription="Payments will appear here when parents accept a plan and submit payment."
          >
            {data.recentPayments.map((payment) => (
              <DashboardListItem
                key={payment.id}
                title={payment.parent?.user?.name ?? "Parent not linked"}
                description={`${payment.student?.fullName ?? payment.enrollment?.student?.fullName ?? "Child"} | ${formatAmount(payment.currency, payment.amount)} | ${humanize(payment.paymentMethod)}`}
                status={payment.status}
                href={`/admin/payments/${payment.id}`}
              />
            ))}
          </CompactList>
        </SectionCard>

        <SectionCard
          title="Reports Awaiting Review"
          description="Tutor reports ready for editorial review and publishing."
          href="/admin/reports"
          hrefLabel="View reports"
        >
          <CompactList
            emptyTitle="No reports in review"
            emptyDescription="Submitted tutor reports will appear here before publishing."
          >
            {data.reportsAwaitingReview.map((report) => (
              <DashboardListItem
                key={report.id}
                title={report.title ?? "Progress report"}
                description={`${report.student?.fullName ?? "Student"} | Tutor: ${report.tutor?.user?.name ?? "Tutor"} | ${formatDate(report.reportingMonth ?? report.createdAt)}`}
                status={report.status}
                href={`/admin/reports/${report.id}`}
              />
            ))}
          </CompactList>
        </SectionCard>
      </div>

      <SectionCard
        title="Tutor Workload"
        description="Active students, lesson load, homework, and report activity per tutor."
        href="/admin/tutors"
        hrefLabel="View tutors"
      >
        <CompactList
          emptyTitle="No tutor workload yet"
          emptyDescription="Tutor workload will appear after active enrollments and scheduled lessons are assigned."
        >
          {data.tutorWorkload.map((tutor) => (
            <DashboardListItem
              key={tutor.tutorId}
              title={tutor.tutorName}
              description={`${tutor.assignedEnrollments} active students | ${tutor.lessons} lessons | ${tutor.homeworkAssigned} homework | ${tutor.reports} reports`}
              status={tutor.status}
            />
          ))}
        </CompactList>
      </SectionCard>

      <ActivityFeed
        title="Recent Operational Activity"
        description="Recent assessment, payment, lesson, report, support, and communication updates across TopMox."
        items={data.recentActivity}
        emptyTitle="No operational activity yet"
        emptyDescription="Recent operational updates will appear here as records change."
      />
    </section>
  );
}

export function ParentDashboardView({ data }: { data: ParentDashboardData }) {
  if (data.user.role !== "PARENT") {
    return <RoleMismatchState expectedRole="PARENT" />;
  }

  const nextAction = getParentNextAction(data);
  const currentEnrollment = data.activeEnrollment ?? data.enrollments[0] ?? null;
  const planName =
    currentEnrollment?.tutoringPlan?.name ?? data.recommendedPlan?.name ?? "No plan yet";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Parent Dashboard"
        description="Your guided TopMox workspace for child profiles, assessment progress, tutoring plans, lessons, homework, reports, and support."
      />

      <SectionCard
        title="Family Profile"
        description="Each child gets a learning profile so TopMox can recommend structured academic support."
        href="/parent/children"
        hrefLabel="Manage children"
      >
        <CompactList
          emptyTitle="No child profile yet"
          emptyDescription="Add your child's learning details so TopMox can recommend the right academic support."
        >
          {data.childProfiles.map((child) => (
            <DashboardListItem
              key={child.id}
              title={child.fullName ?? "Child profile"}
              description={`${child.age ?? "Age not set"} years | ${child.classYearGroup ?? "Class not set"} | ${child.curriculum ?? "Curriculum not set"} | ${child.subjects?.map((subject) => subject.name).join(", ") || "Subjects not set"}`}
              href={`/parent/children/${child.id}`}
            />
          ))}
        </CompactList>
      </SectionCard>

      <Card className="border-warm-gold/30 bg-soft-cream/40 shadow-soft">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl text-deep-navy">
            Next Action
          </CardTitle>
          <p className="text-sm leading-6 text-text-secondary">
            {nextAction.description}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <StatusBadge label={nextAction.badgeLabel} tone={nextAction.badgeTone} />
            <p className="mt-3 text-2xl font-semibold text-deep-navy">
              {nextAction.title}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={nextAction.href}>
              {nextAction.ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Active Plan and Payment"
          description="A simple view of the current tutoring plan and payment state."
          href={currentEnrollment ? "/parent/enrollments" : "/parent/assessments"}
          hrefLabel={currentEnrollment ? "View plans" : "View assessments"}
        >
          {currentEnrollment ? (
            <div className="rounded-xl border border-border/80 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-deep-navy">{planName}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {currentEnrollment.student?.fullName ?? "Child"} | Enrollment status
                  </p>
                </div>
                <StatusBadge
                  label={humanize(currentEnrollment.status)}
                  tone={toneForStatus(currentEnrollment.status)}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <MiniMetric label="Pending" value={data.paymentStatusSummary.pending} />
                <MiniMetric
                  label="Awaiting verification"
                  value={data.paymentStatusSummary.awaitingVerification}
                />
                <MiniMetric label="Paid" value={data.paymentStatusSummary.paid} />
                <MiniMetric label="Failed" value={data.paymentStatusSummary.failed} />
              </div>
            </div>
          ) : (
            <EmptyState
              title="No tutoring plan yet"
              description="Once TopMox recommends a plan after assessment, it will appear here."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Lessons"
          description="Your next confirmed lesson will appear here."
          href="/parent/lessons"
          hrefLabel="View lessons"
        >
          {data.nextUpcomingLesson ? (
            <DashboardListItem
              title={data.nextUpcomingLesson.title ?? "Upcoming lesson"}
              description={`${data.nextUpcomingLesson.student?.fullName ?? "Child"} | ${data.nextUpcomingLesson.subject?.name ?? "Subject"} | ${formatDateTime(data.nextUpcomingLesson.startTime)}${data.nextUpcomingLesson.timezone ? ` | ${data.nextUpcomingLesson.timezone}` : ""}`}
              status={data.nextUpcomingLesson.status}
              href={`/parent/lessons/${data.nextUpcomingLesson.id}`}
            />
          ) : (
            <EmptyState
              title="No lessons scheduled yet"
              description="Once TopMox assigns a tutor and confirms your schedule, lessons will appear here."
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Homework"
          description="Practice work assigned by your child's tutor."
          href="/parent/homework"
          hrefLabel="View homework"
        >
          <CompactList
            emptyTitle="No homework assigned yet"
            emptyDescription="When your child's tutor assigns practice work, it will appear here."
          >
            {data.homeworkDue.map((homework) => (
              <DashboardListItem
                key={homework.id}
                title={homework.title}
                description={`${homework.student?.fullName ?? "Child"} | Due ${formatDate(homework.dueDate)}`}
                status={homework.status}
                href="/parent/homework"
              />
            ))}
          </CompactList>
        </SectionCard>

        <SectionCard
          title="Reports"
          description="Published progress reports reviewed by TopMox."
          href="/parent/reports"
          hrefLabel="View reports"
        >
          {data.latestPublishedReport ? (
            <DashboardListItem
              title={data.latestPublishedReport.title ?? "May progress report"}
              description={`${data.latestPublishedReport.student?.fullName ?? "Child"} | ${data.latestPublishedReport.overallProgressStatus ?? "Progress update"} | Published ${formatDate(data.latestPublishedReport.publishedAt)}`}
              status="PUBLISHED"
              href={`/parent/reports/${data.latestPublishedReport.id}`}
            />
          ) : (
            <EmptyState
              title="No progress reports yet"
              description="Your child's first report will appear after lessons have been completed and reviewed."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Support"
          description="Questions and follow-up requests with TopMox."
          href="/parent/support"
          hrefLabel="Get support"
        >
          <CompactList
            emptyTitle="No open support requests"
            emptyDescription="If you need help, create a support request and TopMox will follow up."
          >
            {data.openSupportRequests.map((support) => (
              <DashboardListItem
                key={support.id}
                title={support.subject}
                description={`Updated ${formatDate(support.updatedAt)}`}
                status={support.status}
                href={`/parent/support/${support.id}`}
              />
            ))}
          </CompactList>
        </SectionCard>
      </div>

      <ActivityFeed
        title="Recent Family Activity"
        description="Recent updates for your family across assessments, payments, lessons, homework, reports, and support."
        items={data.recentActivity}
        emptyTitle="No family activity yet"
        emptyDescription="Your recent assessment, payment, lesson, homework, report, and support updates will appear here."
      />
    </section>
  );
}

export function TutorDashboardView({ data }: { data: TutorDashboardData }) {
  if (data.user.role !== "TUTOR") {
    return <RoleMismatchState expectedRole="TUTOR" />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Tutor Dashboard"
        description="Your focused workspace for assigned lessons, student context, homework, and progress report tasks."
        actions={
          <>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/tutor/lessons">View lessons</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/tutor/homework">View homework</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/tutor/reports">View reports</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Today's lessons"
          value={String(data.todayLessons.length)}
          context="Assigned lessons scheduled for today."
          icon={<CalendarClock className="h-5 w-5 text-royal-blue" />}
        />
        <StatCard
          label="Upcoming lessons"
          value={String(data.upcomingLessons.length)}
          context="Future assigned teaching sessions."
          icon={<CalendarClock className="h-5 w-5 text-info" />}
        />
        <StatCard
          label="Lessons needing notes"
          value={String(data.lessonsNeedingNotes.length)}
          context="Lessons that need delivery notes."
          icon={<ClipboardList className="h-5 w-5 text-warning" />}
        />
        <StatCard
          label="Assigned students"
          value={String(data.assignedStudents.length)}
          context="Students linked to your active enrollments."
          icon={<Users className="h-5 w-5 text-success" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Today’s Work"
          description="Lessons and follow-up tasks to keep your teaching day clear."
          href="/tutor/lessons"
          hrefLabel="View lessons"
        >
          <CompactList
            emptyTitle="No lessons assigned yet"
            emptyDescription="New lessons will appear here when TopMox schedules them."
          >
            {[...data.todayLessons, ...data.upcomingLessons.slice(0, 3)].map(
              (lesson) => (
                <DashboardListItem
                  key={lesson.id}
                  title={lesson.title ?? "Lesson"}
                  description={`${lesson.student?.fullName ?? "Student"} | ${lesson.subject?.name ?? "Subject"} | ${formatDateTime(lesson.startTime)}${lesson.timezone ? ` | ${lesson.timezone}` : ""}`}
                  status={lesson.status}
                  href={`/tutor/lessons/${lesson.id}`}
                />
              )
            )}
          </CompactList>
        </SectionCard>

        <SectionCard
          title="Lessons Needing Notes"
          description="Complete notes soon after lessons so parents and TopMox have clear visibility."
          href="/tutor/lessons"
          hrefLabel="Open lessons"
        >
          <CompactList
            emptyTitle="No lessons need notes"
            emptyDescription="Lessons needing notes will appear here after delivery."
          >
            {data.lessonsNeedingNotes.map((lesson) => (
              <DashboardListItem
                key={lesson.id}
                title={lesson.title ?? "Lesson needs notes"}
                description={`${lesson.student?.fullName ?? "Student"} | ${lesson.subject?.name ?? "Subject"} | ${formatDateTime(lesson.startTime)}`}
                status={lesson.status}
                href={`/tutor/lessons/${lesson.id}`}
              />
            ))}
          </CompactList>
        </SectionCard>
      </div>

      <SectionCard
        title="Assigned Students"
        description="Students currently linked to your active TopMox teaching load."
        href="/tutor/students"
        hrefLabel="View students"
      >
        <CompactList
          emptyTitle="No assigned students yet"
          emptyDescription="Assigned students will appear here after TopMox activates enrollments and assigns you."
        >
          {data.assignedStudents.map((student) => (
            <DashboardListItem
              key={student.enrollmentId ?? student.id}
              title={student.fullName ?? "Student"}
              description={`${student.classYearGroup ?? "Class not set"} | ${student.curriculum ?? "Curriculum not set"} | ${student.planName ?? "Plan not linked"}`}
              href="/tutor/students"
            />
          ))}
        </CompactList>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Homework"
          description="Recently assigned student practice work."
          href="/tutor/homework"
          hrefLabel="View homework"
        >
          <CompactList
            emptyTitle="No homework assigned"
            emptyDescription="Homework you assign from lessons will appear here."
          >
            {data.homeworkAssigned.map((homework) => (
              <DashboardListItem
                key={homework.id}
                title={homework.title}
                description={`${homework.student?.fullName ?? "Student"} | Due ${formatDate(homework.dueDate)}`}
                status={homework.status}
                href="/tutor/homework"
              />
            ))}
          </CompactList>
        </SectionCard>

        <SectionCard
          title="Reports"
          description="Draft reports, submitted reports, and monthly report reminders."
          href="/tutor/reports"
          hrefLabel="View reports"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Draft reports" value={data.reports.draft.length} />
            <MiniMetric label="Reports in review" value={data.reports.inReview.length} />
            <MiniMetric label="Reports due" value={data.reports.due.length} />
          </div>
          <div className="mt-4 space-y-3">
            {[...data.reports.draft, ...data.reports.inReview].slice(0, 4).map(
              (report) => (
                <DashboardListItem
                  key={report.id}
                  title={report.student?.fullName ?? "Student report"}
                  description={`Reporting month: ${formatDate(report.reportingMonth)}`}
                  href={`/tutor/reports/${report.id}`}
                />
              )
            )}
          </div>
        </SectionCard>
      </div>

      <ActivityFeed
        title="Recent Teaching Activity"
        description="Recent lesson, homework, report, and notification updates for your assigned students."
        items={data.recentActivity}
        emptyTitle="No teaching activity yet"
        emptyDescription="Assigned lessons, homework, and report updates will appear here as TopMox schedules your work."
      />
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/80 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-deep-navy">{value}</p>
    </div>
  );
}

function getParentNextAction(data: ParentDashboardData): {
  title: string;
  description: string;
  badgeLabel: string;
  badgeTone: StatusTone;
  ctaLabel: string;
  href: string;
} {
  if (!data.parentProfileStatus.hasParentProfile) {
    return {
      title: "Complete parent profile",
      description:
        "Start by completing your parent profile so TopMox knows how to contact and support your family.",
      badgeLabel: "Step 1",
      badgeTone: "warning",
      ctaLabel: "Complete parent profile",
      href: "/parent/onboarding"
    };
  }

  if (!data.parentProfileStatus.hasChildren) {
    return {
      title: "Add child profile",
      description:
        "Add your child's learning details so TopMox can prepare the right assessment path.",
      badgeLabel: "Step 2",
      badgeTone: "warning",
      ctaLabel: "Add child profile",
      href: "/parent/children/new"
    };
  }

  if (!data.latestAssessment) {
    return {
      title: "Book child assessment",
      description:
        "Book an assessment so TopMox can understand your child's needs before recommending support.",
      badgeLabel: "Next",
      badgeTone: "info",
      ctaLabel: "Book child assessment",
      href: "/book-assessment"
    };
  }

  const pendingEnrollment = data.enrollments.find(
    (enrollment) => enrollment.status === "PENDING_PAYMENT"
  );

  if (pendingEnrollment) {
    return {
      title: "Choose payment method",
      description:
        "Your recommended plan has been accepted. Choose online checkout or manual transfer details as the next step.",
      badgeLabel: "Pending payment",
      badgeTone: "warning",
      ctaLabel: "Choose payment method",
      href: `/parent/payments/new?enrollmentId=${pendingEnrollment.id}`
    };
  }

  if (data.paymentStatusSummary.awaitingVerification > 0) {
    return {
      title: "Payment under review",
      description:
        "TopMox is reviewing the payment details before activating your child's tutoring plan.",
      badgeLabel: "Awaiting verification",
      badgeTone: "warning",
      ctaLabel: "View payments",
      href: "/parent/payments"
    };
  }

  if (data.activeEnrollment && data.nextUpcomingLesson) {
    return {
      title: "View next lesson",
      description:
        "Your child's tutoring plan is active and the next lesson is scheduled.",
      badgeLabel: "Lesson scheduled",
      badgeTone: "success",
      ctaLabel: "View next lesson",
      href: `/parent/lessons/${data.nextUpcomingLesson.id}`
    };
  }

  if (data.activeEnrollment) {
    return {
      title: "Lessons will appear after scheduling",
      description:
        "Your child's plan is active. TopMox will schedule lessons and show them here.",
      badgeLabel: "Plan active",
      badgeTone: "success",
      ctaLabel: "View lessons",
      href: "/parent/lessons"
    };
  }

  if (data.latestAssessment.status === "PLAN_RECOMMENDED") {
    return {
      title: "Accept recommended plan",
      description:
        "TopMox has prepared a recommended tutoring plan. Review and accept it when ready.",
      badgeLabel: "Recommendation ready",
      badgeTone: "success",
      ctaLabel: "Accept recommended plan",
      href: `/parent/assessments/${data.latestAssessment.id}`
    };
  }

  if (data.latestAssessment.status === "PENDING_REVIEW") {
    return {
      title: "Await TopMox review",
      description:
        "TopMox is reviewing your child's details and will confirm the next step.",
      badgeLabel: "Pending review",
      badgeTone: "warning",
      ctaLabel: "View assessment",
      href: `/parent/assessments/${data.latestAssessment.id}`
    };
  }

  if (data.latestAssessment.status === "SCHEDULED") {
    return {
      title: "View assessment details",
      description:
        "Your child's assessment has been scheduled. Review the time and meeting details.",
      badgeLabel: "Scheduled",
      badgeTone: "info",
      ctaLabel: "View assessment",
      href: `/parent/assessments/${data.latestAssessment.id}`
    };
  }

  if (data.latestAssessment.status === "COMPLETED") {
    return {
      title: "Await recommendation",
      description:
        "The assessment is complete. TopMox is preparing the learning recommendation.",
      badgeLabel: "Completed",
      badgeTone: "success",
      ctaLabel: "View assessment",
      href: `/parent/assessments/${data.latestAssessment.id}`
    };
  }

  return {
    title: "View tutoring journey",
    description:
      "Track the next step for your child's TopMox tutoring journey.",
    badgeLabel: humanize(data.latestAssessment.status),
    badgeTone: toneForStatus(data.latestAssessment.status),
    ctaLabel: "View assessments",
    href: "/parent/assessments"
  };
}
