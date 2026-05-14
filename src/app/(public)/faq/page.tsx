import type { Metadata } from "next";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { FAQSection } from "@/components/marketing/FAQSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";

const faqItems = [
  {
    question: "How does TopMox Global Tutoring work?",
    answer:
      "Parents start by booking a child assessment. TopMox reviews academic needs, recommends a support direction, coordinates tutor-led lessons, and provides progress visibility through notes, homework, and reports."
  },
  {
    question: "Why do you start with a child assessment?",
    answer:
      "Children can struggle for different reasons. Assessment helps identify root gaps and learning priorities so support is structured to help from the beginning."
  },
  {
    question: "Is this only for children in Nigeria?",
    answer:
      "No. TopMox supports families in Nigeria and across diaspora locations including the UK, US, Canada, Ireland, Europe, UAE, and other regions."
  },
  {
    question: "Can children outside Nigeria join?",
    answer:
      "Yes. Lessons are delivered online, with scheduling designed to support different family routines and time zones."
  },
  {
    question: "What subjects do you support?",
    answer:
      "TopMox currently supports Mathematics, English, Science, Reading and Comprehension, Exam Preparation, and Homework Support."
  },
  {
    question: "How are tutors assigned?",
    answer:
      "Tutor assignment is guided by assessment outcomes, subject needs, and scheduling fit. The goal is structured support that aligns with the child profile."
  },
  {
    question: "Will parents receive progress updates?",
    answer:
      "Yes. Parent visibility is a core part of the model, including lesson updates, homework context, tutor notes, and periodic progress reporting."
  },
  {
    question: "How are lessons delivered?",
    answer:
      "Lessons are delivered online in scheduled sessions with clear structure and follow-through support."
  },
  {
    question: "Can lessons work across time zones?",
    answer:
      "Yes. TopMox coordinates lesson timing around practical availability windows to support families in different regions."
  },
  {
    question: "Do you guarantee grades?",
    answer:
      "No. TopMox does not guarantee grades. Support is designed to help children improve understanding, confidence, consistency, and academic direction."
  },
  {
    question: "How do payments work?",
    answer:
      "For MVP, payments are tracked through a structured process with admin verification and clear status updates for parents."
  },
  {
    question: "What happens after I book an assessment?",
    answer:
      "A TopMox coordinator reviews your submission, follows up on next steps, and guides your family toward a suitable tutoring recommendation."
  }
] as const;

export default function FaqPage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            Parent FAQ
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Practical answers before you begin
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            This page is designed to reduce uncertainty so you can move forward
            with confidence. If your question is not listed, use the contact page
            and a TopMox coordinator will guide you.
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Frequently Asked Questions"
            title="Clear, parent-focused guidance"
            description="TopMox Global Tutoring is structured to help families move from confusion to clarity."
          />
          <FAQSection items={[...faqItems]} />
        </section>

        <section>
          <Card className="border-border shadow-soft">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-text-primary md:text-2xl">
                Still deciding?
              </h2>
              <p className="mt-3 text-sm text-text-secondary md:text-base">
                The first step is simple: book a child assessment. You get clearer
                direction on what your child needs and what support pathway is
                likely to fit best.
              </p>
            </CardContent>
          </Card>
        </section>

        <AssessmentCTA
          title="Book a child assessment and get structured academic direction."
          description="TopMox helps parents replace guesswork with a guided support process built around clarity, consistency, and visible progress."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "FAQ | TopMox Global Tutoring",
  description:
    "Answers to common parent questions about TopMox Global Tutoring, including assessment-first support, subjects, time zones, and progress updates."
};
