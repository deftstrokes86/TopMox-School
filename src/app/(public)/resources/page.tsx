import type { Metadata } from "next";
import { BookOpenText, Lightbulb, SearchCheck } from "lucide-react";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { OfferBenefitCard } from "@/components/marketing/OfferBenefitCard";
import { ResourceCard } from "@/components/marketing/ResourceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { getDefaultResourceUiRecords } from "@/lib/resources/default-resource-records";
import { filterPublicResourcesForDisplay } from "@/lib/utils/resource-ui";
import { getPublishedResources } from "@/server/queries/resource.queries";

export const dynamic = "force-dynamic";

const RESOURCE_QUERY_TIMEOUT_MS = 2500;

async function withPublicResourceFallback<T>(
  promise: Promise<T>,
  fallback: T,
  label: string
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const guardedPromise = promise
    .catch((error) => {
      console.error(`${label} failed to load:`, error);
      return fallback;
    })
    .finally(() => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });

  const timeoutPromise = new Promise<T>((resolve) => {
    timeout = setTimeout(() => {
      console.error(`${label} timed out.`);
      resolve(fallback);
    }, RESOURCE_QUERY_TIMEOUT_MS);
  });

  return Promise.race([guardedPromise, timeoutPromise]);
}

async function loadPublishedResources() {
  const resources = await withPublicResourceFallback(
    getPublishedResources(),
    getDefaultResourceUiRecords(),
    "Published resources"
  );

  return filterPublicResourcesForDisplay(resources);
}

export default async function ResourcesPage() {
  const resources = await loadPublishedResources();

  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            Parent Resources
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Parent Resources
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            Guides to help parents understand online tutoring, academic
            support, and child learning progress.
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Resource Library"
            title="Helpful guidance for clearer next steps"
            description="Read parent-focused resources from TopMox Global Tutoring, written to support confidence, clarity, and structured academic decisions."
          />
          {resources.length === 0 ? (
            <EmptyState
              title="Resources are being prepared"
              description="Resources are being prepared. Check back soon for parent guides from TopMox Global Tutoring."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <ResourceCard key={resource.slug} resource={resource} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Why This Matters"
            title="Guidance plus structure creates better results"
            description="Resources help parents make informed decisions, but progress accelerates when guidance is paired with structured tutoring support."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <OfferBenefitCard
              icon={SearchCheck}
              title="Clarity before action"
              description="Understand what your child may need before committing to a support plan."
            />
            <OfferBenefitCard
              icon={BookOpenText}
              title="Practical parent education"
              description="Get useful frameworks you can apply at home without overwhelm."
            />
            <OfferBenefitCard
              icon={Lightbulb}
              title="Smarter next steps"
              description="Use assessment-first tutoring to turn insight into structured progress."
            />
          </div>
        </section>

        <AssessmentCTA
          title="Read, then take the next step with a child assessment."
          description="TopMox helps families move from knowledge to structured academic support with clearer direction and parent visibility."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Resources | TopMox Global Tutoring",
  description:
    "Parent education resources from TopMox Global Tutoring on online tutoring, mathematics support, reading habits, and exam preparation."
};
