import type { Metadata } from "next";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SubjectSupportCard } from "@/components/marketing/SubjectSupportCard";

export default function SubjectsPage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            Subject Support
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Subject support designed around your child&apos;s learning needs
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white md:text-base">
            TopMox supports core academic subjects with an assessment-first
            approach that is structured to help children gain confidence,
            consistency, and clearer learning direction.
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Subjects We Support"
            title="Explore support areas for your child"
            description="Each subject path is built around common struggles, structured tutoring support, and parent visibility."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SubjectSupportCard
              subject="Mathematics"
              commonStruggle="Difficulty with foundational concepts and problem solving."
              howTopMoxHelps="Lessons are structured to help diagnose gaps, rebuild understanding, and improve confidence."
              parentOutcome="You get clearer visibility into progress and next-step priorities."
              href="/subjects/mathematics"
              ctaLabel="Explore Mathematics"
            />
            <SubjectSupportCard
              subject="English"
              commonStruggle="Inconsistent grammar, writing clarity, and comprehension."
              howTopMoxHelps="Support is focused on reading, grammar, writing structure, and communication development."
              parentOutcome="You can track improvements in confidence and language consistency."
              href="/subjects/english"
              ctaLabel="Explore English"
            />
            <SubjectSupportCard
              subject="Science"
              commonStruggle="Memorizing without understanding and weak application."
              howTopMoxHelps="Tutors use clear explanations and guided practice to build concept understanding."
              parentOutcome="You see whether your child is growing in confidence and academic discipline."
              href="/subjects/science"
              ctaLabel="Explore Science"
            />
            <SubjectSupportCard
              subject="Reading & Comprehension"
              commonStruggle="Slow reading fluency, weak vocabulary, and low confidence."
              howTopMoxHelps="Support is designed to help with fluency, comprehension habits, and vocabulary growth."
              parentOutcome="You gain practical direction for supporting reading routines at home."
              href="/subjects/reading-comprehension"
              ctaLabel="Explore Reading Support"
            />
            <SubjectSupportCard
              subject="Exam Preparation"
              commonStruggle="Poor planning, weak revision rhythm, and exam anxiety."
              howTopMoxHelps="Preparation is built around assessment findings, structured plans, and tutor accountability."
              parentOutcome="You can follow structured prep progress instead of guessing readiness."
              href="/exam-prep"
              ctaLabel="Explore Exam Prep"
            />
            <SubjectSupportCard
              subject="Homework Support"
              commonStruggle="Incomplete homework, weak follow-through, and inconsistent study rhythm."
              howTopMoxHelps="Tutoring is focused on routine, accountability, and practical assignment support."
              parentOutcome="Homework becomes more consistent and less stressful for the family."
              href="/book-assessment"
              ctaLabel="Start with Assessment"
            />
          </div>
        </section>

        <AssessmentCTA
          title="Start with an assessment to find the right subject support."
          description="TopMox is built around assessment and progress visibility so your child receives support that is structured, focused, and practical."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Subjects | TopMox Global Tutoring",
  description:
    "Explore Mathematics, English, Science, Reading & Comprehension, Exam Preparation, and Homework Support from TopMox Global Tutoring."
};
