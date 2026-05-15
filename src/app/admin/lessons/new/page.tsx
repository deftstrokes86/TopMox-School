import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LessonForm } from "@/components/forms/admin/lesson-form";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getActiveEnrollmentsForLessonScheduling
} from "@/server/queries/enrollment.queries";
import { getAdminLessonSubjects } from "@/server/queries/lesson.queries";
import { getActiveTutors } from "@/server/queries/tutor.queries";

export const dynamic = "force-dynamic";

type AdminNewLessonPageProps = {
  searchParams: {
    enrollmentId?: string;
  };
};

export default async function AdminNewLessonPage({
  searchParams
}: AdminNewLessonPageProps) {
  const [enrollments, tutors, subjects] = await Promise.all([
    getActiveEnrollmentsForLessonScheduling(),
    getActiveTutors(),
    getAdminLessonSubjects()
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Schedule Lesson"
        description="Create a scheduled lesson for an active enrollment. Recurring scheduling and lesson notes come later."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/lessons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Link>
          </Button>
        }
      />

      {enrollments.length === 0 || tutors.length === 0 || subjects.length === 0 ? (
        <EmptyState
          title="Scheduling is not ready yet"
          description="You need at least one active enrollment, active tutor, and subject before scheduling lessons."
          action={
            <Button asChild>
              <Link href="/admin/enrollments">Review Enrollments</Link>
            </Button>
          }
        />
      ) : (
        <Card className="border-royal-blue/20 bg-white">
          <CardContent className="p-5">
            <LessonForm
              enrollments={enrollments}
              tutors={tutors}
              subjects={subjects}
              defaultEnrollmentId={searchParams.enrollmentId}
            />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
