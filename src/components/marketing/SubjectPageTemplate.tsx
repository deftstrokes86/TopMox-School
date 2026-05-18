import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

import { AssessmentCTA } from "./AssessmentCTA";
import { CommonStruggleCard } from "./CommonStruggleCard";
import { LearningOutcomeCard } from "./LearningOutcomeCard";

type StruggleItem = {
  title: string;
  description: string;
};

type SubjectPageTemplateProps = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  struggles: StruggleItem[];
  approachPoints: string[];
  lessonCoverage: string[];
  outcomes: StruggleItem[];
  recommendedPlans: StruggleItem[];
  parentVisibility: string[];
  ctaTitle: string;
  ctaDescription: string;
};

export function SubjectPageTemplate({
  heroBadge,
  heroTitle,
  heroDescription,
  struggles,
  approachPoints,
  lessonCoverage,
  outcomes,
  recommendedPlans,
  parentVisibility,
  ctaTitle,
  ctaDescription
}: SubjectPageTemplateProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            {heroBadge}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white md:text-base">
            {heroDescription}
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Common Struggles"
            title="What parents often notice first"
            description="TopMox is structured to help identify these patterns early and respond with clear support."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {struggles.map((item) => (
              <CommonStruggleCard
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="TopMox Approach"
            title="Assessment-first, then structured support"
            description="This subject support is designed to help children improve with consistency while keeping parents informed."
          />
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm text-text-secondary">
                {approachPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Lesson Focus"
            title="What lessons may cover"
            description="Coverage is structured around the child profile, current level, and priority gaps."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lessonCoverage.map((item) => (
              <Card key={item} className="border-border shadow-soft">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-text-primary">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Expected Outcomes"
            title="Designed to support measurable momentum"
            description="Outcomes are focused on confidence, clarity, and consistency rather than unrealistic promises."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {outcomes.map((item) => (
              <LearningOutcomeCard
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Plan Fit"
            title="Recommended plan types"
            description="Final plan direction is based on assessment findings and support intensity needed."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedPlans.map((item) => (
              <Card key={item.title} className="border-border shadow-soft">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Parent Visibility"
            title="You stay informed through every stage"
            description="Parents can expect structured visibility, not uncertainty."
          />
          <div className="flex flex-wrap gap-2">
            {parentVisibility.map((item) => (
              <StatusBadge key={item} label={item} tone="info" />
            ))}
          </div>
        </section>

        <AssessmentCTA title={ctaTitle} description={ctaDescription} />
      </div>
    </section>
  );
}
