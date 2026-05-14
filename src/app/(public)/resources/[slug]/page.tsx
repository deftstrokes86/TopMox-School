import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { ResourceCard } from "@/components/marketing/ResourceCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAllResources,
  getRelatedResources,
  getResourceBySlug
} from "@/lib/demo-data/resources";

type ResourceDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllResources().map((resource) => ({
    slug: resource.slug
  }));
}

export function generateMetadata({
  params
}: ResourceDetailPageProps): Metadata {
  const resource = getResourceBySlug(params.slug);

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

export default function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const resource = getResourceBySlug(params.slug);

  if (!resource) {
    notFound();
  }

  const relatedResources = getRelatedResources(resource.slug, 3);

  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            {resource.category}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            {resource.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            {resource.excerpt}
          </p>
          <div className="mt-6">
            <Button asChild className="bg-white text-deep-navy hover:bg-white/90">
              <Link href="/book-assessment">Book a Child Assessment</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-7">
          <Card className="border-border shadow-soft">
            <CardContent className="space-y-8 p-6 md:p-8">
              <p className="text-base text-text-secondary">{resource.intro}</p>
              {resource.sections.map((section) => (
                <article key={section.heading} className="space-y-3">
                  <h2 className="text-2xl font-semibold text-text-primary">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm text-text-secondary md:text-base">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul className="space-y-2 text-sm text-text-secondary md:text-base">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>- {bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Next Step"
            title="Ready to move from reading to action?"
            description="Book a child assessment so TopMox can translate these insights into a structured support direction for your child."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/book-assessment">Book a Child Assessment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">View Tutoring Plans</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Related Resources"
            title="Keep learning with these parent guides"
            description="Explore more practical support articles focused on clarity, consistency, and progress."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {relatedResources.map((relatedResource) => (
              <ResourceCard key={relatedResource.slug} resource={relatedResource} />
            ))}
          </div>
        </section>

        <AssessmentCTA
          title="Book an assessment and build a clearer learning path."
          description="TopMox Global Tutoring is designed to help parents move from uncertainty to structured support with experienced educators and visible progress."
        />
      </div>
    </section>
  );
}
