import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { ResourceCard } from "@/components/marketing/ResourceCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getDefaultResourceUiRecordBySlug,
  getDefaultResourceUiRecords
} from "@/lib/resources/default-resource-records";
import {
  buildPublicResourceDetailView,
  filterPublicResourcesForDisplay
} from "@/lib/utils/resource-ui";
import {
  getPublishedResourceBySlug,
  getRecentPublishedResources
} from "@/server/queries/resource.queries";

export const dynamic = "force-dynamic";

const RESOURCE_QUERY_TIMEOUT_MS = 2500;

type ResourceDetailPageProps = {
  params: {
    slug: string;
  };
};

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

async function loadPublishedResource(slug: string) {
  return withPublicResourceFallback(
    getPublishedResourceBySlug(slug),
    getDefaultResourceUiRecordBySlug(slug),
    "Published resource detail"
  );
}

async function loadRelatedResources(currentSlug: string) {
  const resources = await withPublicResourceFallback(
    getRecentPublishedResources(4),
    getDefaultResourceUiRecords(),
    "Related resources"
  );

  return filterPublicResourcesForDisplay(resources).filter(
    (resource) => resource.slug !== currentSlug
  );
}

export async function generateMetadata({
  params
}: ResourceDetailPageProps): Promise<Metadata> {
  const resource = await loadPublishedResource(params.slug);

  if (!resource) {
    return {
      title: "Resource Not Found | TopMox Global Tutoring",
      description: "This resource could not be found."
    };
  }

  return {
    title: `${resource.title} | TopMox Global Tutoring`,
    description: resource.excerpt
  };
}

export default async function ResourceDetailPage({
  params
}: ResourceDetailPageProps) {
  const resource = buildPublicResourceDetailView(
    await loadPublishedResource(params.slug)
  );

  if (!resource) {
    notFound();
  }

  const relatedResources = await loadRelatedResources(resource.slug);

  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            {resource.category}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            {resource.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white md:text-base">
            {resource.excerpt}
          </p>
          <div className="mt-6">
            <Button asChild className="bg-white text-deep-navy hover:bg-white/90">
              <Link href="/book-assessment">Book a Child Assessment</Link>
            </Button>
          </div>
        </section>

        <Card className="border-border shadow-soft">
          <CardContent className="space-y-5 p-6 md:p-8">
            {resource.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-7 text-text-secondary md:text-base"
              >
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>

        <section className="rounded-2xl border border-warm-gold/30 bg-warm-gold/10 p-6 md:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-royal-blue">
              Next Step
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-deep-navy md:text-3xl">
              Want clearer support for your child?
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary md:text-base">
              A child assessment helps TopMox understand the learning context
              before recommending a structured support direction.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/book-assessment">Book a Child Assessment</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/resources">Back to Resources</Link>
              </Button>
            </div>
          </div>
        </section>

        {relatedResources.length > 0 ? (
          <section className="space-y-7">
            <SectionHeader
              eyebrow="Related Resources"
              title="Keep learning with these parent guides"
              description="Explore more practical TopMox guidance focused on clarity, consistency, and structured progress."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {relatedResources.map((relatedResource) => (
                <ResourceCard
                  key={relatedResource.slug}
                  resource={relatedResource}
                />
              ))}
            </div>
          </section>
        ) : null}

        <AssessmentCTA
          title="Book an assessment and build a clearer learning path."
          description="TopMox Global Tutoring helps parents move from uncertainty to structured support with visible next steps."
        />
      </div>
    </section>
  );
}
