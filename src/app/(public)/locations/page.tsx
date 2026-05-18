import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { ArrowRight, Globe2, MapPinned } from "lucide-react";

import { RegionSwitcher } from "@/components/marketing/RegionSwitcher";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PUBLIC_REGION_OPTIONS,
  REGION_COOKIE_NAME
} from "@/lib/constants/locations";
import { resolveVisitorRegion } from "@/server/services/location.service";

export const dynamic = "force-dynamic";

export default function LocationsPage() {
  const resolvedRegion = resolveVisitorRegion({
    headers: headers(),
    cookie: cookies().get(REGION_COOKIE_NAME)?.value
  });

  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            Locations
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            TopMox tutoring support for families in Nigeria and abroad.
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white md:text-base">
            Choose the country that best matches your family and explore how
            TopMox can support your child with assessment-led online tutoring,
            homework follow-through, and parent visibility.
          </p>
          <div className="mt-6 max-w-xl">
            <RegionSwitcher currentRegionCode={resolvedRegion.region.code} />
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="Tutoring By Country"
            title="Choose a tutoring region"
            description="Each location page explains the parent support story, subject focus, scheduling approach, and pricing context for that country."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PUBLIC_REGION_OPTIONS.map((region) => (
              <Card key={region.code} className="border-border shadow-soft">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary">
                        {region.name}
                      </h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        {region.currencySymbol} {region.currency}
                      </p>
                    </div>
                    <span className="rounded-full bg-soft-blue px-3 py-1 text-xs font-semibold text-royal-blue">
                      {region.currency}
                    </span>
                  </div>
                  <p className="mt-4 flex-1 text-sm text-text-secondary">
                    {region.shortDescription}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-text-secondary">
                    <MapPinned className="h-4 w-4 text-royal-blue" />
                    <span>{region.timezoneExamples[0]}</span>
                  </div>
                  <Button asChild variant="outline" className="mt-5">
                    <Link href={`/locations/${region.slug}`}>
                      View {region.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-warm-gold/30 bg-soft-cream p-6 md:grid-cols-[auto_1fr] md:p-8">
          <Globe2 className="h-8 w-8 text-warm-gold" />
          <div>
            <h2 className="text-xl font-semibold text-deep-navy">
              A country-aware TopMox experience
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              TopMox keeps the experience familiar for each family while still
              letting parents choose the country that best matches their support
              and pricing context.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Locations | TopMox Global Tutoring",
  description:
    "Choose TopMox Global Tutoring support by country, with parent-friendly guidance, subject support, and clear next steps."
};
