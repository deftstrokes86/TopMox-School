import type { Metadata } from "next";
import { Compass, DollarSign, FileSearch2, Target } from "lucide-react";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { OfferBenefitCard } from "@/components/marketing/OfferBenefitCard";
import { PricingPlanCard } from "@/components/marketing/PricingPlanCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            Tutoring Plans
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Choose support with confidence, not guesswork.
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            Every child has different learning gaps and strengths. TopMox starts
            with a child assessment so you receive a recommendation designed to
            support the right level of tutoring from day one.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge label="Assessment-led recommendation" tone="info" />
            <StatusBadge label="School-backed structure" tone="success" />
            <StatusBadge label="Parent visibility included" tone="neutral" />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Plan Options"
            title="Four structured support pathways for different needs"
            description="Final recommendation after child assessment."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <PricingPlanCard
              name="Starter Support"
              bestFor="Children who need steady reinforcement and improved learning consistency."
              sessionsPerWeek={2}
              coreOutcomes={[
                "Reinforced understanding of key topics",
                "Improved homework consistency",
                "Stronger learning confidence"
              ]}
              parentReceives={[
                "Structured lesson rhythm",
                "Tutor notes with practical context",
                "Homework and follow-through visibility"
              ]}
              progressVisibility="Regular lesson updates and progress reporting designed to help parents track momentum."
            />
            <PricingPlanCard
              name="Growth Plan"
              bestFor="Children who need stronger academic momentum across one or more core subjects."
              sessionsPerWeek={3}
              coreOutcomes={[
                "Faster gap recovery with structured support",
                "Improved discipline and study rhythm",
                "Clearer academic direction"
              ]}
              parentReceives={[
                "Consistent tutor-led support",
                "Visible homework and attendance tracking",
                "Monthly progress insight"
              ]}
              progressVisibility="Parents can monitor lessons, notes, homework, and report trends without chasing updates."
            />
            <PricingPlanCard
              name="Exam Prep Intensive"
              bestFor="Learners preparing for major exams who need focused structure and accountability."
              sessionsPerWeek={4}
              coreOutcomes={[
                "Prioritized revision support",
                "Improved exam readiness confidence",
                "More consistent prep execution"
              ]}
              parentReceives={[
                "Tutor accountability on prep cadence",
                "Feedback on readiness patterns",
                "Progress-focused communication"
              ]}
              progressVisibility="Parents receive clearer signals on preparation consistency and support next steps."
            />
            <PricingPlanCard
              name="Homework Club"
              bestFor="Families that want guided homework follow-through and calmer home study routines."
              sessionsPerWeek={2}
              coreOutcomes={[
                "Better assignment completion habits",
                "Reduced homework stress",
                "Stronger academic routine"
              ]}
              parentReceives={[
                "Structured homework support sessions",
                "Practical updates on follow-through",
                "Guidance for home learning routines"
              ]}
              progressVisibility="Parents can see homework consistency and tutor feedback in a structured format."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Why We Start With Assessment"
            title="It protects your child from the wrong plan and wasted effort."
            description="Assessment-first support increases certainty, gives parents clarity, and helps TopMox recommend the right support intensity."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OfferBenefitCard
              icon={FileSearch2}
              title="Different root causes"
              description="Children can struggle for different reasons, even when symptoms look similar."
            />
            <OfferBenefitCard
              icon={Target}
              title="Right support level"
              description="Assessment helps identify support depth so your child is not over- or under-supported."
            />
            <OfferBenefitCard
              icon={Compass}
              title="Clear recommendation"
              description="Parents get practical direction on what to do next and why it matters."
            />
            <OfferBenefitCard
              icon={DollarSign}
              title="Smarter investment"
              description="Structured diagnosis helps reduce fear of paying for support that does not fit your child."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="What Parents Value"
            title="Confidence, visibility, and a guided process"
            description="TopMox is designed to reduce parent uncertainty while improving support consistency for your child."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  From concern to clarity
                </h3>
                <p className="mt-3 text-sm text-text-secondary">
                  You start with concerns, then receive a clearer plan, a structured
                  support pathway, and visible progress updates.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  School-backed accountability
                </h3>
                <p className="mt-3 text-sm text-text-secondary">
                  TopMox combines experienced educators, guided lesson structure,
                  and parent communication designed to help families stay
                  informed and proactive.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Structured recommendation" tone="info" />
            <StatusBadge label="Experienced educators" tone="success" />
            <StatusBadge label="Monthly progress reports" tone="neutral" />
            <StatusBadge label="Flexible online lessons" tone="warning" />
          </div>
        </section>

        <AssessmentCTA
          title="Book a child assessment and get the right tutoring direction."
          description="Start with clarity, then move forward with a plan designed to support your child and keep you fully informed."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Pricing | TopMox Global Tutoring",
  description:
    "Explore TopMox tutoring plan options and why every recommendation starts with a child assessment for better fit and parent confidence."
};
