import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssessmentStatusMeta } from "@/lib/utils/assessment-status";
import { getAssessmentRequestForCurrentParent } from "@/server/queries/assessment.queries";

export const dynamic = "force-dynamic";

type ParentAssessmentDetailPageProps = {
  params: {
    id: string;
  };
};

function formatDate(value: Date | null): string {
  if (!value) {
    return "Not scheduled yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(value);
}

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Not scheduled yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function DetailItem({
  label,
  value
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-text-primary">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function ParentAssessmentDetailPage({
  params
}: ParentAssessmentDetailPageProps) {
  const assessment = await getAssessmentRequestForCurrentParent(params.id);

  if (!assessment) {
    notFound();
  }

  const status = getAssessmentStatusMeta(assessment.status);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assessment Details"
        description="Review the information TopMox will use to understand your child's needs and coordinate the next step."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/assessments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl text-deep-navy">
                {assessment.student.fullName}
              </CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                {assessment.student.classYearGroup} |{" "}
                {assessment.student.curriculum}
              </p>
            </div>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
          <p className="max-w-3xl text-sm text-text-secondary">
            {status.parentDescription}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem label="Child Age" value={`${assessment.student.age}`} />
            <DetailItem
              label="Preferred Date"
              value={`${formatDate(assessment.preferredAssessmentDate)} at ${
                assessment.preferredAssessmentTime
              }`}
            />
            <DetailItem label="Timezone" value={assessment.timezone} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              Subjects
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {assessment.subjects.map((subject) => (
                <span
                  key={subject.id}
                  className="rounded-full bg-soft-blue/50 px-3 py-1 text-xs font-medium text-royal-blue"
                >
                  {subject.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                Academic Concern
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {assessment.academicConcern}
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                Parent Notes
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {assessment.notes || "No additional notes were added."}
              </p>
            </div>
          </div>

          <Card className="border-warm-gold/25 bg-warm-gold/10 shadow-none">
            <CardContent className="space-y-3 p-5">
              <p className="font-semibold text-deep-navy">
                Scheduled assessment
              </p>
              <p className="text-sm text-text-secondary">
                {formatDateTime(assessment.scheduledAt)}
              </p>
              {assessment.meetingLink ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a
                    href={assessment.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Meeting Link
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-text-secondary">
                  TopMox will add the meeting link after scheduling the
                  assessment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-royal-blue/20 bg-soft-blue/20 shadow-none">
            <CardContent className="space-y-2 p-5">
              <p className="font-semibold text-deep-navy">
                Recommended plan
              </p>
              <p className="text-sm text-text-secondary">
                Plan recommendation and acceptance will be connected in the next
                assessment phase. For now, this page keeps the parent informed
                about assessment status and scheduling.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  );
}

