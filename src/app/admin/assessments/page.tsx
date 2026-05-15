import type { AssessmentStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT_SUBJECT_OPTIONS } from "@/lib/constants/subjects";
import { getAssessmentStatusMeta } from "@/lib/utils/assessment-status";
import {
  getAdminAssessmentRequests,
  getAssessmentRequestCountsByStatus
} from "@/server/queries/assessment.queries";

export const dynamic = "force-dynamic";

type AdminAssessmentsPageProps = {
  searchParams: {
    parentName?: string;
    studentName?: string;
    status?: string;
    subject?: string;
  };
};

type AssessmentListItem = Awaited<
  ReturnType<typeof getAdminAssessmentRequests>
>[number];

const STATUS_OPTIONS: AssessmentStatus[] = [
  "PENDING_REVIEW",
  "SCHEDULED",
  "COMPLETED",
  "PLAN_RECOMMENDED",
  "CONVERTED",
  "DECLINED"
];

function parseStatus(value?: string): AssessmentStatus | undefined {
  if (!value) {
    return undefined;
  }

  return STATUS_OPTIONS.includes(value as AssessmentStatus)
    ? (value as AssessmentStatus)
    : undefined;
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(value);
}

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function statusLabel(status: AssessmentStatus): string {
  return getAssessmentStatusMeta(status).label;
}

function FilterControls({
  parentName,
  studentName,
  status,
  subject
}: {
  parentName?: string;
  studentName?: string;
  status?: string;
  subject?: string;
}) {
  return (
    <Card className="border-royal-blue/20">
      <CardContent className="p-5">
        <form className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto]" action="/admin/assessments">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Parent name
            </span>
            <input
              name="parentName"
              defaultValue={parentName ?? ""}
              placeholder="Search parent"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Student name
            </span>
            <input
              name="studentName"
              defaultValue={studentName ?? ""}
              placeholder="Search student"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Status
            </span>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {statusLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Subject
            </span>
            <select
              name="subject"
              defaultValue={subject ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All subjects</option>
              {SUPPORT_SUBJECT_OPTIONS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full lg:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button asChild variant="outline" className="w-full lg:w-auto">
              <Link href="/admin/assessments">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AssessmentCard({ assessment }: { assessment: AssessmentListItem }) {
  const status = getAssessmentStatusMeta(assessment.status);

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {assessment.student.fullName}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Parent: {assessment.parent.user.name}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Country / Timezone
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {assessment.parent.country}
            </p>
            <p className="text-xs text-text-muted">{assessment.parent.timezone}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Preferred
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(assessment.preferredAssessmentDate)}
            </p>
            <p className="text-xs text-text-muted">
              {assessment.preferredAssessmentTime ?? "Time not set"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Scheduled
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDateTime(assessment.scheduledAt)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
            Subjects
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {assessment.subjects.map((subjectItem) => (
              <span
                key={subjectItem.id}
                className="rounded-full bg-soft-blue/50 px-3 py-1 text-xs font-medium text-royal-blue"
              >
                {subjectItem.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            Created {formatDateTime(assessment.createdAt)}
          </p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/admin/assessments/${assessment.id}`}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminAssessmentsPage({
  searchParams
}: AdminAssessmentsPageProps) {
  const status = parseStatus(searchParams.status);
  const subjectSlug = searchParams.subject || undefined;
  const [counts, assessments] = await Promise.all([
    getAssessmentRequestCountsByStatus(),
    getAdminAssessmentRequests({
      status,
      parentName: searchParams.parentName,
      studentName: searchParams.studentName,
      subjectSlug
    })
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assessment Requests"
        description="Review parent-submitted assessment requests, schedule assessments, and move each request through the approved TopMox workflow."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {STATUS_OPTIONS.map((statusOption) => {
          const meta = getAssessmentStatusMeta(statusOption);
          return (
            <Card key={statusOption} className="border-border/80">
              <CardContent className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  {meta.label}
                </p>
                <p className="text-3xl font-semibold text-deep-navy">
                  {counts[statusOption]}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <FilterControls
        parentName={searchParams.parentName}
        studentName={searchParams.studentName}
        status={searchParams.status}
        subject={searchParams.subject}
      />

      {assessments.length === 0 ? (
        <EmptyState
          title="No assessment requests found"
          description="No assessment requests match the current filters. Clear the filters or wait for new parent submissions."
          action={
            <Button asChild>
              <Link href="/admin">
                <ClipboardList className="mr-2 h-4 w-4" />
                Back to Admin Overview
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CalendarCheck className="h-4 w-4 text-royal-blue" />
            Showing {assessments.length} assessment request
            {assessments.length === 1 ? "" : "s"}.
          </div>
          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

