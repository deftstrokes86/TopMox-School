import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
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
  REGION_COOKIE_NAME,
  type RegionConfig
} from "@/lib/constants/locations";
import { resolveVisitorRegion } from "@/server/services/location.service";

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
    description: `${region.shortDescription} Currency guidance: ${region.currency}.`
  };
}

export default function LocationDetailPage({ params }: LocationPageProps) {
  const region = getRegionBySlug(params.slug);

  if (!region) {
    notFound();
  }

  const resolvedRegion = resolveVisitorRegion({
    headers: headers(),
    cookie: cookies().get(REGION_COOKIE_NAME)?.value
  });

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
                  label={`${region.currency} display currency`}
                  tone="info"
                />
                <StatusBadge label="Manual region switcher" tone="success" />
                <StatusBadge label="No hard redirects" tone="neutral" />
              </div>
            </div>
            <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-4 shadow-soft">
              <RegionSwitcher currentRegionCode={resolvedRegion.region.code} />
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
                Currency
              </h2>
              <p className="mt-2 text-2xl font-semibold text-deep-navy">
                {region.currencySymbol} {region.currency}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Displayed as regional guidance. Final pricing is confirmed after
                child assessment.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <CalendarClock className="h-6 w-6 text-royal-blue" />
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                Timezone support
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Example timezone: {region.timezoneExamples.join(", ")}.
                Scheduling is confirmed around family and tutor availability.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <MapPinned className="h-6 w-6 text-royal-blue" />
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                Soft personalization
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Detection is only a helpful guess. You can manually choose a
                different region anytime.
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
            description="The process stays assessment-led, parent-visible, and payment-safe in every region."
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
                Payment options depend on currency, country, and Flutterwave
                account configuration. Manual payment fallback remains available.
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
                question: "Can I change my selected region?",
                answer:
                  "Yes. Use the region switcher at the top of the site. The selection is stored in a simple cookie and can be changed anytime."
              },
              {
                question: "Does TopMox use hard geo redirects?",
                answer:
                  "No. The site uses soft guidance only, so families can always choose the region that fits their situation."
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
