"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppRole } from "@/lib/auth/types";
import type { StatusTone } from "@/lib/constants/statuses";
import {
  getAssessmentStatusMeta,
  getParentAssessmentNextAction,
  type AssessmentStatusValue
} from "@/lib/utils/assessment-status";
import { getHomeworkStatusMeta } from "@/lib/utils/homework-status";
import {
  getLessonStatusMeta,
  type LessonStatusValue
} from "@/lib/utils/lesson-status";
import { resolveParentOnboardingFlow } from "@/lib/utils/parent-onboarding-flow";
import {
  getParentOnboardingStatusAction,
  type ParentOnboardingStatusActionResult
} from "@/server/actions/parent.actions";

type ParentOnboardingStatePanelProps = {
  userName: string;
  userEmail: string;
  role: AppRole;
  initialState?: OnboardingState;
  latestAssessment?: ParentDashboardAssessmentSummary | null;
  nextLesson?: ParentDashboardLessonSummary | null;
  lessonVisibility?: ParentDashboardLessonVisibility | null;
  reportVisibility?: ParentDashboardReportVisibility | null;
  planNextStep?: ParentDashboardPlanNextStep | null;
};

type OnboardingState = NonNullable<ParentOnboardingStatusActionResult["data"]>;

type ParentDashboardAssessmentSummary = {
  id: string;
  status: AssessmentStatusValue;
  childName: string;
  createdAt: string;
  scheduledAt: string | null;
};

type ParentDashboardLessonSummary = {
  id: string;
  title: string;
  childName: string;
  subjectName: string;
  startTime: string;
  status: LessonStatusValue;
  timezone?: string;
};

type ParentDashboardLessonVisibility = {
  recentLessonNote: {
    lessonId: string;
    title: string;
    childName: string;
    subjectName: string;
    lessonNotes: string;
    startTime: string;
  } | null;
  homeworkAssignedCount: number;
  nextHomeworkDue: {
    id: string;
    title: string;
    dueDate: string | null;
    status: "ASSIGNED" | "SUBMITTED" | "REVIEWED" | "OVERDUE";
  } | null;
};

type ParentDashboardReportVisibility = {
  latestReport: {
    id: string;
    childName: string;
    tutorName: string;
    reportingMonth: string;
    publishedAt: string | null;
    progressLabel: string;
    progressTone: StatusTone;
  } | null;
  publishedReportCount: number;
};

export type ParentDashboardPlanNextStep = {
  title: string;
  description: string;
  badgeLabel: string;
  badgeTone: StatusTone;
  ctaLabel?: string;
  ctaHref?: string;
};

function formatDashboardDate(value: string | null): string {
  if (!value) {
    return "Not scheduled yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDashboardMonth(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export function ParentOnboardingStatePanel({
  userName,
  userEmail,
  role,
  initialState,
  latestAssessment,
  nextLesson,
  lessonVisibility,
  reportVisibility,
  planNextStep
}: ParentOnboardingStatePanelProps) {
  const [loading, setLoading] = useState(!initialState);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState | null>(
    initialState ?? null
  );

  useEffect(() => {
    if (initialState) {
      return;
    }

    let mounted = true;

    const loadState = async () => {
      try {
        const result = await getParentOnboardingStatusAction();

        if (!mounted) {
          return;
        }

        if (!result.success || !result.data) {
          setError(result.message || "Unable to load onboarding status.");
          return;
        }

        setState(result.data);
      } catch {
        if (mounted) {
          setError("Unable to load onboarding status right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadState();

    return () => {
      mounted = false;
    };
  }, [initialState]);

  const content = state ? resolveParentOnboardingFlow(state) : null;
  const latestAssessmentStatus = latestAssessment
    ? getAssessmentStatusMeta(latestAssessment.status)
    : null;
  const latestAssessmentAction = latestAssessment
    ? getParentAssessmentNextAction(
        latestAssessment.status,
        latestAssessment.id
      )
    : null;
  const nextLessonStatus = nextLesson
    ? getLessonStatusMeta(nextLesson.status)
    : null;
  const nextHomeworkStatus = lessonVisibility?.nextHomeworkDue
    ? getHomeworkStatusMeta(lessonVisibility.nextHomeworkDue.status)
    : null;

  return (
    <section className="space-y-5">
      <PageHeader
        title="Parent Dashboard"
        description="Your parent dashboard will show your child profiles, assessments, lessons, homework, payments, and progress reports."
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg text-text-primary">
            Signed-in Account
          </CardTitle>
          <p className="text-sm text-text-secondary">
            This area is protected and personalized for your account.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Name
              </p>
              <p className="mt-1 font-medium text-text-primary">{userName}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Email
              </p>
              <p className="mt-1 font-medium text-text-primary">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Current Role:
            </span>
            <StatusBadge label={role} tone="info" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-royal-blue/20 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg text-deep-navy">
            Onboarding Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content ? (
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  label: "Step 1",
                  title: "Parent Profile",
                  active: content.activeStep === 1,
                  complete: content.profileSaved
                },
                {
                  label: "Step 2",
                  title: "Child Profile",
                  active: content.activeStep === 2,
                  complete: content.hasChildProfiles
                },
                {
                  label: "Step 3",
                  title: "Assessment Request",
                  active: content.activeStep === 3,
                  complete: false
                }
              ].map((step) => (
                <div
                  key={step.label}
                  className={
                    step.active
                      ? "rounded-xl border border-royal-blue/30 bg-soft-blue/35 p-4"
                      : step.complete
                        ? "rounded-xl border border-success/30 bg-success/10 p-4"
                        : "rounded-xl border border-border bg-soft-cream/50 p-4"
                  }
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-royal-blue">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-deep-navy">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {step.active
                      ? "Current step"
                      : step.complete
                        ? "Completed"
                        : "Upcoming"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {loading ? (
            <p className="inline-flex items-center text-sm text-text-secondary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking your onboarding status...
            </p>
          ) : null}

          {!loading && error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {!loading && !error && content ? (
            <div className="rounded-xl border border-border/80 bg-soft-cream/35 p-4">
              <p className="text-base font-semibold text-deep-navy">
                {content.title}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {content.description}
              </p>
              {content.state === "READY_FOR_ASSESSMENT" && planNextStep ? (
                <div className="mt-4 rounded-xl border border-warm-gold/30 bg-warm-gold/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                        Tutoring plan next step
                      </p>
                      <p className="mt-1 font-semibold text-deep-navy">
                        {planNextStep.title}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {planNextStep.description}
                      </p>
                    </div>
                    <StatusBadge
                      label={planNextStep.badgeLabel}
                      tone={planNextStep.badgeTone}
                    />
                  </div>
                  {planNextStep.ctaHref && planNextStep.ctaLabel ? (
                    <div className="mt-4">
                      <Button asChild>
                        <Link href={planNextStep.ctaHref}>
                          {planNextStep.ctaLabel}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {content.state === "READY_FOR_ASSESSMENT" &&
              nextLesson &&
              nextLessonStatus ? (
                <div className="mt-4 rounded-xl border border-royal-blue/20 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                        Next Lesson
                      </p>
                      <p className="mt-1 font-semibold text-deep-navy">
                        {nextLesson.title}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {nextLesson.childName} | {nextLesson.subjectName}
                      </p>
                      <p className="mt-2 text-xs text-text-muted">
                        {formatDashboardDate(nextLesson.startTime)}
                        {nextLesson.timezone ? ` | ${nextLesson.timezone}` : ""}
                      </p>
                    </div>
                    <StatusBadge
                      label={nextLessonStatus.label}
                      tone={nextLessonStatus.tone}
                    />
                  </div>
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      <Link href={`/parent/lessons/${nextLesson.id}`}>
                        View Lesson
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
              {content.state === "READY_FOR_ASSESSMENT" &&
              lessonVisibility?.recentLessonNote ? (
                <div className="mt-4 rounded-xl border border-royal-blue/20 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                        Recent Lesson Note
                      </p>
                      <p className="mt-1 font-semibold text-deep-navy">
                        {lessonVisibility.recentLessonNote.title}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {lessonVisibility.recentLessonNote.childName} |{" "}
                        {lessonVisibility.recentLessonNote.subjectName}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {lessonVisibility.recentLessonNote.lessonNotes}
                      </p>
                    </div>
                    <StatusBadge label="Completed" tone="success" />
                  </div>
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      <Link
                        href={`/parent/lessons/${lessonVisibility.recentLessonNote.lessonId}`}
                      >
                        View Lesson Notes
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
              {content.state === "READY_FOR_ASSESSMENT" && lessonVisibility ? (
                <div className="mt-4 rounded-xl border border-warm-gold/30 bg-warm-gold/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                        Homework
                      </p>
                      <p className="mt-1 font-semibold text-deep-navy">
                        {lessonVisibility.homeworkAssignedCount} active homework{" "}
                        {lessonVisibility.homeworkAssignedCount === 1
                          ? "task"
                          : "tasks"}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {lessonVisibility.nextHomeworkDue
                          ? `Next due: ${lessonVisibility.nextHomeworkDue.title}`
                          : "Assigned homework will appear here after lessons."}
                      </p>
                      {lessonVisibility.nextHomeworkDue?.dueDate ? (
                        <p className="mt-2 text-xs text-text-muted">
                          Due:{" "}
                          {formatDashboardDate(
                            lessonVisibility.nextHomeworkDue.dueDate
                          )}
                        </p>
                      ) : null}
                    </div>
                    {nextHomeworkStatus ? (
                      <StatusBadge
                        label={nextHomeworkStatus.label}
                        tone={nextHomeworkStatus.tone}
                      />
                    ) : (
                      <StatusBadge label="No active homework" tone="neutral" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline">
                      <Link href="/parent/homework">
                        View Homework
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/parent/lessons">
                        View Lessons
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
              {content.state === "READY_FOR_ASSESSMENT" &&
              reportVisibility ? (
                <div className="mt-4 rounded-xl border border-royal-blue/20 bg-white p-4">
                  {reportVisibility.latestReport ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                          Latest Progress Report
                        </p>
                        <p className="mt-1 font-semibold text-deep-navy">
                          {reportVisibility.latestReport.childName}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {formatDashboardMonth(
                            reportVisibility.latestReport.reportingMonth
                          )}{" "}
                          | {reportVisibility.latestReport.tutorName}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                          TopMox has published structured feedback so you can
                          see what is improving and what needs attention next.
                        </p>
                      </div>
                      <StatusBadge
                        label={reportVisibility.latestReport.progressLabel}
                        tone={reportVisibility.latestReport.progressTone}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                          Progress Reports
                        </p>
                        <p className="mt-1 font-semibold text-deep-navy">
                          First report coming after reviewed lessons
                        </p>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                          Your child&apos;s first report will appear after
                          lessons have been completed and reviewed.
                        </p>
                      </div>
                      <StatusBadge label="No report yet" tone="neutral" />
                    </div>
                  )}
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      <Link
                        href={
                          reportVisibility.latestReport
                            ? `/parent/reports/${reportVisibility.latestReport.id}`
                            : "/parent/reports"
                        }
                      >
                        {reportVisibility.latestReport
                          ? "View Latest Report"
                          : "View Reports"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
              {content.state === "READY_FOR_ASSESSMENT" &&
              latestAssessment &&
              latestAssessmentStatus &&
              latestAssessmentAction ? (
                <div className="mt-4 rounded-xl border border-royal-blue/20 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                        Latest Assessment
                      </p>
                      <p className="mt-1 font-semibold text-deep-navy">
                        {latestAssessment.childName}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {latestAssessmentAction.description}
                      </p>
                      <p className="mt-2 text-xs text-text-muted">
                        Scheduled:{" "}
                        {formatDashboardDate(latestAssessment.scheduledAt)}
                      </p>
                    </div>
                    <StatusBadge
                      label={latestAssessmentStatus.label}
                      tone={latestAssessmentStatus.tone}
                    />
                  </div>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href={latestAssessmentAction.href}>
                        {latestAssessmentAction.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Button asChild>
                    <Link href={content.ctaHref}>
                      {content.ctaLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
