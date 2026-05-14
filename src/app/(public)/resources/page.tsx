import type { Metadata } from "next";
import { BookOpenText, Lightbulb, SearchCheck } from "lucide-react";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { OfferBenefitCard } from "@/components/marketing/OfferBenefitCard";
import { ResourceCard } from "@/components/marketing/ResourceCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { getAllResources } from "@/lib/demo-data/resources";

export default function ResourcesPage() {
  const resources = getAllResources();

  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            Parent Resources
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Practical guidance for parents who want clearer academic support
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            Explore educational articles designed to reduce uncertainty and help
            you make better support decisions for your child.
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Resource Library"
            title="Start with these core parent guides"
            description="These resources are written to support confidence, clarity, and structured action."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
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
