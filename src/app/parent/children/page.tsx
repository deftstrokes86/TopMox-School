import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { ParentOnboardingProgress } from "@/components/forms/parent/parent-onboarding-progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";
import { getCurrentParentChildren } from "@/server/queries/student.queries";

export const dynamic = "force-dynamic";

type ChildListItem = Awaited<ReturnType<typeof getCurrentParentChildren>>[number];

function formatChallengePreview(challenge: string): string {
  if (challenge.length <= 110) {
    return challenge;
  }

  return `${challenge.slice(0, 107)}...`;
}

export default async function ParentChildrenPage() {
  const [children, onboardingStatus] = await Promise.all([
    getCurrentParentChildren(),
    getParentOnboardingStatus()
  ]);

  const hasChildren = children.length > 0;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Children"
        description="Each child gets their own learning profile so TopMox can prepare focused support, clearer recommendations, and better academic direction."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/parent/children/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </Link>
          </Button>
        }
      />

      <ParentOnboardingProgress
        activeStep={2}
        profileSaved={onboardingStatus.hasParentProfile}
        hasChildProfiles={hasChildren}
      />

      {!onboardingStatus.hasParentProfile ? (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="space-y-3 p-6">
            <p className="font-semibold text-deep-navy">
              Complete your parent profile first
            </p>
            <p className="text-sm text-text-secondary">
              Your parent profile helps TopMox coordinate communication and
              schedule support around your timezone.
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/parent/onboarding">Go to Parent Onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!onboardingStatus.hasParentProfile ? null : hasChildren ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {children.map((child: ChildListItem) => (
              <Card key={child.id} className="border-border/80">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl text-deep-navy">
                    {child.fullName}
                  </CardTitle>
                  <p className="text-sm text-text-secondary">
                    Age {child.age} | {child.classYearGroup}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                        Country of Study
                      </p>
                      <p className="mt-1 text-sm font-medium text-text-primary">
                        {child.countryOfStudy}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                        Curriculum
                      </p>
                      <p className="mt-1 text-sm font-medium text-text-primary">
                        {child.curriculum}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Subjects Needing Support
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {child.subjects.map((subject: { id: string; name: string }) => (
                        <span
                          key={subject.id}
                          className="rounded-full bg-soft-blue/40 px-3 py-1 text-xs font-medium text-royal-blue"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Main Academic Challenge
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {formatChallengePreview(child.mainAcademicChallenge)}
                    </p>
                  </div>

                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={`/parent/children/${child.id}`}>
                      View/Edit Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-royal-blue/20 bg-soft-blue/20">
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-deep-navy">
                  Your child profile is ready for the next step
                </p>
                <p className="text-sm text-text-secondary">
                  Next: Book a Child Assessment so TopMox can recommend the
                  right learning path.
                </p>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/book-assessment">Next: Book a Child Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          title="No child profile yet"
          description="No child profile yet. Add your child's learning details so TopMox can recommend the right academic support."
          action={
            <Button asChild>
              <Link href="/parent/children/new">Add Child Profile</Link>
            </Button>
          }
        />
      )}
    </section>
  );
}
