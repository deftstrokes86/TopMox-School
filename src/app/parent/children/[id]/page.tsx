import { notFound, redirect } from "next/navigation";

import { ChildProfileForm } from "@/components/forms/parent/child-profile-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";
import { getChildProfileByIdForCurrentParent } from "@/server/queries/student.queries";

export const dynamic = "force-dynamic";

type ChildProfileDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function ChildProfileDetailPage({
  params
}: ChildProfileDetailPageProps) {
  const onboardingStatus = await getParentOnboardingStatus();

  if (!onboardingStatus.hasParentProfile) {
    redirect("/parent/onboarding");
  }

  const child = await getChildProfileByIdForCurrentParent(params.id);

  if (!child) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Child Profile: ${child.fullName}`}
        description="Update this learning profile as your child's needs evolve. TopMox uses this to keep support targeted and accountable."
      />

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg text-deep-navy">
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Age
            </p>
            <p className="mt-1 font-medium text-text-primary">{child.age}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Class/Year Group
            </p>
            <p className="mt-1 font-medium text-text-primary">
              {child.classYearGroup}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Curriculum
            </p>
            <p className="mt-1 font-medium text-text-primary">
              {child.curriculum}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-royal-blue/20 shadow-soft">
        <CardContent className="p-6 md:p-8">
          <ChildProfileForm
            mode="edit"
            childId={child.id}
            initialValues={{
              fullName: child.fullName,
              age: child.age,
              classYearGroup: child.classYearGroup,
              countryOfStudy: child.countryOfStudy,
              curriculum: child.curriculum,
              subjectsNeedingSupport: child.subjects.map(
                (subject: { slug: string }) => subject.slug
              ),
              mainAcademicChallenge: child.mainAcademicChallenge,
              academicGoal: child.academicGoal ?? "",
              preferredLessonDays: child.preferredLessonDays,
              preferredLessonTime: child.preferredLessonTime
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
