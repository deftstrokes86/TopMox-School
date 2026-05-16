import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Send
} from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { getTutorLessonDashboardSummary } from "@/lib/utils/lesson-dashboard";
import { getLessonStatusMeta } from "@/lib/utils/lesson-status";
import { getTutorLessonWorkSummary } from "@/lib/utils/tutor-lesson-delivery";
import { getTutorReportDashboardSummary } from "@/lib/utils/tutor-report-ui";
import { getCurrentTutorHomework } from "@/server/queries/homework.queries";
import { getCurrentTutorLessons } from "@/server/queries/lesson.queries";
import { getCurrentTutorActivityFeed } from "@/server/queries/activity.queries";
import {
  getCurrentTutorReports,
  getReportsDueForTutor
} from "@/server/queries/report.queries";

export const dynamic = "force-dynamic";

function formatLessonDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

type TutorDashboardLesson = ReturnType<
  typeof getTutorLessonDashboardSummary
>["today"][number];

function DashboardLessonCard({ lesson }: { lesson: TutorDashboardLesson }) {
  const status = getLessonStatusMeta(lesson.status);

  return (
    <div className="rounded-xl border border-border/80 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-deep-navy">{lesson.title}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {lesson.childName} | {lesson.subjectName}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {formatLessonDateTime(lesson.startTime)}
            {lesson.timezone ? ` | ${lesson.timezone}` : ""}
          </p>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>
      <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
        <Link href={`/tutor/lessons/${lesson.id}`}>
          View Teaching Context
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export default async function TutorDashboardPage() {
  const user = await requireDashboardAccess("TUTOR");
  const [lessons, homework, reports, reportsDue, tutorActivity] = await Promise.all([
    getCurrentTutorLessons(),
    getCurrentTutorHomework(),
    getCurrentTutorReports(),
    getReportsDueForTutor(),
    getCurrentTutorActivityFeed(8)
  ]);
  const lessonSummary = getTutorLessonDashboardSummary(lessons);
  const workSummary = getTutorLessonWorkSummary(lessons, homework);
  const reportSummary = getTutorReportDashboardSummary(reports, reportsDue);
  const nextLessons = [
    ...lessonSummary.today,
    ...lessonSummary.upcoming.slice(0, Math.max(0, 3 - lessonSummary.today.length))
  ].slice(0, 3);
  const recentlyCompletedLessons = lessons
    .filter((lesson) => lesson.status === "COMPLETED")
    .sort((left, right) => right.startTime.getTime() - left.startTime.getTime())
    .slice(0, 3)
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      childName: lesson.student.fullName,
      subjectName: lesson.subject.name,
      startTime: lesson.startTime,
      status: lesson.status,
      timezone: lesson.timezone,
      meetingLink: lesson.meetingLink
    }));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Tutor Dashboard"
        description="See your assigned TopMox lessons and the teaching context needed for upcoming sessions."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/tutor/lessons">
              <CalendarDays className="mr-2 h-4 w-4" />
              View All Lessons
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg text-text-primary">
            Signed-in Account
          </CardTitle>
          <p className="text-sm text-text-secondary">
            This is your protected tutor workspace for assigned lessons,
            delivery notes, and homework follow-through.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Name
              </p>
              <p className="mt-1 font-medium text-text-primary">{user.name}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Email
              </p>
              <p className="mt-1 font-medium text-text-primary">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Current Role:
            </span>
            <StatusBadge label={user.role} tone="info" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Lessons Needing Notes"
          value={String(workSummary.lessonsNeedingNotes)}
          context="Scheduled lessons at or before now"
          icon={<ClipboardCheck className="h-4 w-4 text-royal-blue" />}
        />
        <StatCard
          label="Upcoming Lessons"
          value={String(workSummary.upcomingLessons)}
          context="Assigned future lessons"
          icon={<CalendarDays className="h-4 w-4 text-royal-blue" />}
        />
        <StatCard
          label="Recently Completed"
          value={String(workSummary.recentlyCompletedLessons)}
          context="Completed lesson records"
          icon={<ClipboardCheck className="h-4 w-4 text-success" />}
        />
        <StatCard
          label="Homework Assigned"
          value={String(workSummary.activeHomework)}
          context="Active homework follow-up"
          icon={<BookOpenCheck className="h-4 w-4 text-warm-gold" />}
        />
      </div>

      <ActivityFeed
        title="Recent Teaching Activity"
        description="A quick trail of lesson, homework, report, and notification updates for your assigned students."
        items={tutorActivity}
        emptyTitle="No teaching activity yet"
        emptyDescription="Assigned lessons, homework, and report updates will appear here as TopMox schedules your work."
      />

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              Progress Reports
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Draft monthly progress reports for assigned students and send
              them to TopMox admin for review.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/tutor/reports">
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/tutor/reports/new">
                <Send className="mr-2 h-4 w-4" />
                Draft Report
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Draft Reports"
              value={String(reportSummary.draftReports)}
              context="Editable before admin review"
              icon={<FileText className="h-4 w-4 text-warm-gold" />}
            />
            <StatCard
              label="In Review"
              value={String(reportSummary.reportsInReview)}
              context="Submitted to TopMox admin"
              icon={<Send className="h-4 w-4 text-royal-blue" />}
            />
            <StatCard
              label="Students Needing Report"
              value={String(reportSummary.studentsNeedingReport)}
              context="Active assigned enrollments due this month"
              icon={<ClipboardCheck className="h-4 w-4 text-success" />}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              Today and Upcoming
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Your next assigned lessons will appear here as TopMox schedules
              active enrollments.
            </p>
          </div>
          <StatusBadge
            label={`${lessonSummary.today.length} today`}
            tone={lessonSummary.today.length > 0 ? "info" : "neutral"}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {nextLessons.length > 0 ? (
            nextLessons.map((lesson) => (
              <DashboardLessonCard key={lesson.id} lesson={lesson} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-6 text-sm text-text-secondary">
              No assigned lessons are scheduled yet. When TopMox assigns a
              lesson to you, it will appear here with the student and subject
              context.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-warm-gold/25">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              Recently Completed Lessons
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Completed lesson records give you a quick trail of recent teaching
              activity.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/tutor/homework">
              <BookOpenCheck className="mr-2 h-4 w-4" />
              View Homework
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentlyCompletedLessons.length > 0 ? (
            recentlyCompletedLessons.map((lesson) => (
              <DashboardLessonCard key={lesson.id} lesson={lesson} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-6 text-sm text-text-secondary">
              Completed lessons will appear here after you mark assigned lessons
              delivered.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
