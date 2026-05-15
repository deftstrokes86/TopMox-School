import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { AssessmentRequestForm } from "@/components/forms/parent/assessment-request-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";
import { BRAND } from "@/lib/constants/brand";
import { resolveBookAssessmentReadiness } from "@/lib/utils/assessment-readiness";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";
import { getAssessmentEligibleChildrenForCurrentParent } from "@/server/queries/assessment.queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Book a Child Assessment | ${BRAND.PRODUCT_NAME}`,
  description:
    "Request a child assessment so TopMox can review your child's academic needs and recommend the right learning path."
};

const assessmentReasons = [
  "Children struggle for different reasons, so the starting point should be diagnosis, not guesswork.",
  "TopMox reviews the child's needs before recommending a tutoring path.",
  "The assessment helps avoid placing your child into the wrong level of support.",
  "Parents get a clearer next step before lessons begin."
];

export default async function BookAssessmentPage() {
  await requireDashboardAccess("PARENT");

  const onboardingStatus = await getParentOnboardingStatus();
  const readiness = resolveBookAssessmentReadiness(onboardingStatus);
  const children =
    readiness.state === "READY"
      ? await getAssessmentEligibleChildrenForCurrentParent()
      : [];

  return (
    <main className="bg-brand-sheen">
      <section className="container space-y-8 py-12 md:py-16">
        <PageHeader
          title="Book a Child Assessment"
          description="Start with clarity. Tell us where your child needs support, and TopMox will review the details before recommending the right learning path."
          actions={
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/parent/assessments">View My Assessments</Link>
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.2fr]">
          <div className="space-y-4">
            <Card className="border-warm-gold/25 bg-white/90">
              <CardContent className="space-y-4 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-royal-blue">
                  Why assessment first
                </p>
                <h2 className="text-2xl font-semibold text-deep-navy">
                  The right support starts with understanding the child.
                </h2>
                <p className="text-sm text-text-secondary">
                  Assessment gives TopMox a structured way to understand what
                  the parent is seeing at home, what the child may be
                  struggling with, and what support level makes sense next.
                </p>
                <div className="space-y-3">
                  {assessmentReasons.map((reason) => (
                    <div key={reason} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <p className="text-sm text-text-secondary">{reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-royal-blue/20 bg-soft-blue/25">
              <CardContent className="p-6">
                <p className="font-semibold text-deep-navy">
                  What happens after submission?
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  A TopMox academic coordinator reviews the request, checks the
                  child profile, and confirms the next assessment step before
                  any tutoring recommendation is made.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-royal-blue/20 bg-white/95 shadow-lifted">
            <CardContent className="p-6 md:p-8">
              {readiness.state === "READY" ? (
                <AssessmentRequestForm childrenOptions={children} />
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-warm-gold/35 bg-warm-gold/10 p-5">
                    <p className="text-xl font-semibold text-deep-navy">
                      {readiness.title}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {readiness.description}
                    </p>
                  </div>
                  {readiness.ctaHref ? (
                    <Button asChild className="w-full sm:w-auto">
                      <Link href={readiness.ctaHref}>
                        {readiness.ctaLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

