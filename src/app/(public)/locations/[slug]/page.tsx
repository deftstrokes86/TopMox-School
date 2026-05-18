import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  MapPinned
} from "lucide-react";

import { FAQSection } from "@/components/marketing/FAQSection";
import { RegionSwitcher } from "@/components/marketing/RegionSwitcher";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PUBLIC_REGION_OPTIONS,
  type RegionConfig
} from "@/lib/constants/locations";

type LocationPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

function getRegionBySlug(slug: string): RegionConfig | undefined {
  return PUBLIC_REGION_OPTIONS.find((region) => region.slug === slug);
}

function RegionListCard({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <Card className="h-full border-border shadow-soft">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <ul className="mt-4 space-y-2 text-sm text-text-secondary">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function generateMetadata({ params }: LocationPageProps): Metadata {
  const region = getRegionBySlug(params.slug);

  if (!region) {
    return {
      title: "Location Not Found | TopMox Global Tutoring"
    };
  }

  return {
    title: `${region.name} Online Tutoring | TopMox Global Tutoring`,
    description: `${region.shortDescription} Start with a child assessment and get tutoring support for families in ${region.name}.`
  };
}

export default function LocationDetailPage({ params }: LocationPageProps) {
  const region = getRegionBySlug(params.slug);

  if (!region) {
    notFound();
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-white via-soft-blue/40 to-soft-cream p-7 shadow-lifted md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full bg-royal-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-royal-blue">
                TopMox in {region.name}
              </p>
              <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight text-deep-navy md:text-5xl">
                {region.headline}
              </h1>
              <p className="mt-4 text-sm text-text-secondary md:text-base">
                {region.shortDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge
                  label={`Tutoring in ${region.name}`}
                  tone="info"
                />
                <StatusBadge label={`${region.currency} pricing context`} tone="success" />
                <StatusBadge label="Parent progress updates" tone="neutral" />
              </div>
            </div>
            <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-4 shadow-soft">
              <RegionSwitcher
                currentRegionCode={region.code}
                compact
                jumpToLocation
              />
              <Button asChild className="mt-4 w-full">
                <Link href="/book-assessment">Book a Child Assessment</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <CreditCard className="h-6 w-6 text-royal-blue" />
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                Pricing context
              </h2>
              <p className="mt-2 text-2xl font-semibold text-deep-navy">
                {region.currencySymbol} {region.currency}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Plans for families in {region.name} can be discussed in{" "}
                {region.currency}. Final pricing is confirmed after child
                assessment.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <CalendarClock className="h-6 w-6 text-royal-blue" />
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                Lesson scheduling
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Lesson times are confirmed around family and tutor availability
                so support fits your routine.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <MapPinned className="h-6 w-6 text-royal-blue" />
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                Parent visibility
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Parents can follow lessons, homework, notes, and reports from
                one clear account.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <RegionListCard
            title={`What ${region.name} parents often need`}
            items={region.parentPainPoints}
          />
          <RegionListCard
            title="Why TopMox works here"
            items={region.offerBenefits}
          />
          <RegionListCard
            title="Subject support"
            items={region.subjectsFocus}
          />
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="How It Works"
            title={`A structured path for families in ${region.name}`}
            description="The process stays assessment-led, parent-visible, and practical from first assessment to active lessons."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Book a child assessment",
              "Get a learning recommendation",
              "Accept the plan and choose payment path",
              "Start lessons after activation"
            ].map((step, index) => (
              <Card key={step} className="border-border shadow-soft">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal-blue">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 text-base font-semibold text-text-primary">
                    {step}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-warm-gold/30 bg-soft-cream p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <BookOpenCheck className="h-7 w-7 shrink-0 text-warm-gold" />
            <div>
              <h2 className="text-xl font-semibold text-deep-navy">
                Payment and currency note
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {region.paymentNotes}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                TopMox confirms available online or assisted payment options
                after assessment and plan acceptance.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="FAQ"
            title={`${region.name} tutoring questions`}
            description="Straight answers for parents before they book a child assessment."
          />
          <FAQSection
            items={[
              ...region.faq,
              {
                question: "What happens after I book an assessment?",
                answer:
                  "TopMox reviews your child's needs, recommends a practical tutoring path, then confirms the plan, schedule, and payment instructions."
              },
              {
                question: "How will I track my child's progress?",
                answer:
                  "Parents can see lesson activity, homework, tutor notes, and progress reports as tutoring continues."
              }
            ]}
          />
        </section>

        <section className="grid gap-4 rounded-2xl border border-royal-blue/20 bg-white p-6 shadow-soft md:grid-cols-[auto_1fr] md:p-8">
          <HelpCircle className="h-8 w-8 text-royal-blue" />
          <div>
            <h2 className="text-xl font-semibold text-deep-navy">
              Not sure which support path fits?
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Start with a child assessment. TopMox can review your child&rsquo;s
              current needs before recommending a plan.
            </p>
          </div>
        </section>

        <CTASection
          title={`Start TopMox tutoring support for your family in ${region.name}.`}
          description="Begin with an assessment so the recommendation is based on what your child needs, not guesswork."
          primaryHref="/book-assessment"
          secondaryHref="/pricing"
        />
      </div>
    </section>
  );
}
