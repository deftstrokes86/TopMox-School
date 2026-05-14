import type { Metadata } from "next";
import {
  BarChart3,
  ClipboardCheck,
  Compass,
  Target,
  Timer,
  UserCheck
} from "lucide-react";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { OfferBenefitCard } from "@/components/marketing/OfferBenefitCard";
import { ProcessStepCard } from "@/components/marketing/ProcessStepCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

export default function ExamPrepPage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            Exam Preparation Support
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Assessment-first exam prep support with structure and accountability
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            TopMox Exam Prep is designed to support learners who need clearer
            preparation direction, stronger study rhythm, and better confidence
            going into tests.
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Who Exam Prep Is For"
            title="For learners who need focused preparation support"
            description="This support is structured to help children prepare with more clarity and less last-minute panic."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <OfferBenefitCard
              icon={Target}
              title="Unclear readiness"
              description="When parents are unsure whether current study habits are enough for upcoming exams."
            />
            <OfferBenefitCard
              icon={Timer}
              title="Weak pacing"
              description="When learners understand content but struggle to perform under timed conditions."
            />
            <OfferBenefitCard
              icon={Compass}
              title="Inconsistent strategy"
              description="When revision exists but lacks structure, prioritization, and accountability."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Assessment-First Preparation"
            title="Start with diagnosis before drilling"
            description="TopMox uses assessment findings to shape the prep direction so lessons are focused on what matters most."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProcessStepCard
              step="Step 1"
              title="Book Assessment"
              description="Capture child profile, priorities, and exam timeline."
            />
            <ProcessStepCard
              step="Step 2"
              title="Identify Gaps"
              description="Pinpoint topic weaknesses, pacing issues, and confidence barriers."
            />
            <ProcessStepCard
              step="Step 3"
              title="Build Study Plan"
              description="Create a structured prep path with practical weekly priorities."
            />
            <ProcessStepCard
              step="Step 4"
              title="Track Progress"
              description="Follow lesson outcomes and readiness signals through clear parent updates."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Study Plan Structure"
            title="Preparation is built around consistency"
            description="The prep experience is structured to help learners improve rhythm, confidence, and exam decision-making."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  What the plan can include
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                  <li>Priority topic sequencing based on assessment</li>
                  <li>Timed practice routines for pacing confidence</li>
                  <li>Error review and correction loops</li>
                  <li>Weekly tutor-led accountability check-ins</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  Mock-test orientation
                </h3>
                <p className="mt-3 text-sm text-text-secondary">
                  TopMox can support mock-test style practice and feedback as part
                  of tutoring guidance. This MVP does not include a full test
                  engine, but prep is focused on improving readiness and exam
                  behavior.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Tutor Accountability"
            title="Consistent tutor guidance with visible parent updates"
            description="Preparation is supported through structured lesson delivery and practical communication."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <OfferBenefitCard
              icon={UserCheck}
              title="Tutor consistency"
              description="Lessons are delivered with clear goals and tracked follow-through."
            />
            <OfferBenefitCard
              icon={ClipboardCheck}
              title="Homework accountability"
              description="Assignments are tied to prep priorities and reviewed for improvement."
            />
            <OfferBenefitCard
              icon={BarChart3}
              title="Progress visibility"
              description="Parents can track readiness signals through notes and report updates."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Lesson visibility" tone="info" />
            <StatusBadge label="Homework follow-through" tone="warning" />
            <StatusBadge label="Tutor notes" tone="neutral" />
            <StatusBadge label="Progress updates" tone="success" />
          </div>
        </section>

        <AssessmentCTA
          title="Start exam prep with an assessment, not guesswork."
          description="Book a child assessment to get a structured preparation direction and clearer confidence about next steps."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Exam Preparation | TopMox Global Tutoring",
  description:
    "Assessment-first exam prep support focused on structured study plans, tutor accountability, and parent progress visibility."
};
