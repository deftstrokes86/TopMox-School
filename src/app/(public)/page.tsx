import type { Metadata } from "next";
import {
  BarChart3,
  BookOpenCheck,
  CalendarCheck2,
  ClipboardCheck,
  Compass,
  Eye,
  Globe2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  LineChart,
  MapPinned,
  NotebookPen,
  School,
  ShieldCheck,
  Target
} from "lucide-react";

import { FAQSection } from "@/components/marketing/FAQSection";
import { HeroShell } from "@/components/marketing/HeroShell";
import { OfferBenefitCard } from "@/components/marketing/OfferBenefitCard";
import { PlanPreviewCard } from "@/components/marketing/PlanPreviewCard";
import { ProcessStepCard } from "@/components/marketing/ProcessStepCard";
import { SubjectSupportCard } from "@/components/marketing/SubjectSupportCard";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicHomePage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-14 md:space-y-20">
        <HeroShell
          title="School-backed online tutoring for children in Nigeria and abroad."
          subtitle="TopMox Global Tutoring helps parents move from uncertainty to a clear academic support plan through experienced educators, live lessons, structured learning paths, and visible progress."
          trustMicrocopy="Powered by TopMox Schools"
          benefitChips={[
            "Structured learning plans",
            "Experienced educators",
            "Monthly progress reports",
            "Flexible online lessons"
          ]}
        />
        <TrustStrip
          items={[
            "Designed to help children improve with structure and consistency",
            "Built to support parent confidence with clear updates",
            "Focused on discipline, confidence, and academic direction",
            "Guided from assessment to plan to tutor to lessons"
          ]}
        />

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Parent Reality"
            title="When your child is struggling, guesswork is exhausting."
            description="Many parents want to help, but they are left piecing together advice from school reports, random tutors, and inconsistent updates. TopMox is built to replace that uncertainty with structure."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  What parents often say
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                  <li>&ldquo;My child is struggling, but I don&rsquo;t know exactly why.&rdquo;</li>
                  <li>&ldquo;I have tried tutors before, but there was no structure.&rdquo;</li>
                  <li>&ldquo;I want support I can trust.&rdquo;</li>
                  <li>&ldquo;I need updates, not guesswork.&rdquo;</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-royal-blue/20 bg-soft-blue/35 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-deep-navy">
                  The TopMox response
                </h3>
                <p className="mt-3 text-sm text-text-secondary">
                  Your child starts with a structured assessment, then receives a
                  focused learning recommendation, tutor support, and regular
                  visibility. You stay informed and involved without carrying the
                  process alone.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="School-Backed Trust"
            title="This is not random tutoring."
            description="TopMox Global Tutoring is backed by TopMox Schools and built as a guided academic support system with process, accountability, and parent visibility."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OfferBenefitCard
              icon={School}
              title="Backed by an existing school"
              description="Parents work with a school-rooted tutoring team, not anonymous freelancers."
            />
            <OfferBenefitCard
              icon={ClipboardCheck}
              title="Structured assessment first"
              description="Every child starts with a clear intake process to identify what support is needed."
            />
            <OfferBenefitCard
              icon={Eye}
              title="Parent visibility built in"
              description="You receive lesson context, homework updates, tutor notes, and progress reporting."
            />
            <OfferBenefitCard
              icon={Handshake}
              title="Guided support system"
              description="TopMox helps coordinate recommendation, tutor assignment, and lesson rhythm."
            />
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Outcome Promise"
            title="Support built around what parents truly want."
            description="TopMox Global Tutoring is designed to help children build confidence and understanding while giving parents a clearer, calmer path forward."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <OfferBenefitCard
              icon={BookOpenCheck}
              title="Better understanding"
              description="Lessons are structured around core learning gaps and practical reinforcement."
            />
            <OfferBenefitCard
              icon={ShieldCheck}
              title="More confidence"
              description="Children are coached with consistency and encouragement, not pressure."
            />
            <OfferBenefitCard
              icon={CalendarCheck2}
              title="Better study rhythm"
              description="Families get a repeatable cadence designed to support discipline and momentum."
            />
            <OfferBenefitCard
              icon={Compass}
              title="Clearer academic direction"
              description="Recommendations are focused on what the child needs now and what comes next."
            />
            <OfferBenefitCard
              icon={Target}
              title="Accountability"
              description="Tutoring is structured around follow-through, notes, and visible next steps."
            />
            <OfferBenefitCard
              icon={LineChart}
              title="Visible progress"
              description="Monthly reporting is focused on what is improving and what still needs support."
            />
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="How It Works"
            title="A simple 4-step path to clarity and support."
            description="Parents can start quickly while TopMox handles the academic support process with structure."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProcessStepCard
              step="Step 1"
              title="Book a Child Assessment"
              description="Share your child details and academic concerns so we can start with context."
            />
            <ProcessStepCard
              step="Step 2"
              title="Get a Learning Recommendation"
              description="Receive a structured recommendation focused on your child's current needs."
            />
            <ProcessStepCard
              step="Step 3"
              title="Start Lessons With a TopMox Tutor"
              description="Begin online sessions with an experienced educator and clear lesson rhythm."
            />
            <ProcessStepCard
              step="Step 4"
              title="Track Progress Through Reports"
              description="Follow progress with notes, homework visibility, and monthly reporting."
            />
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Subjects"
            title="Focused support across core learning areas."
            description="Each subject is taught with parent-centered outcomes and structured reinforcement."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SubjectSupportCard
              subject="Mathematics"
              outcome="Builds numeracy confidence and problem-solving discipline."
            />
            <SubjectSupportCard
              subject="English"
              outcome="Strengthens writing clarity, grammar control, and communication."
            />
            <SubjectSupportCard
              subject="Science"
              outcome="Improves concept understanding and application-based thinking."
            />
            <SubjectSupportCard
              subject="Reading & Comprehension"
              outcome="Develops fluency, inference, and comprehension confidence."
            />
            <SubjectSupportCard
              subject="Exam Preparation"
              outcome="Supports strategy, pacing, and structured revision routines."
            />
            <SubjectSupportCard
              subject="Homework Support"
              outcome="Creates consistency, accountability, and stronger school readiness."
            />
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Parent Visibility"
            title="Know what is happening without chasing updates."
            description="TopMox is built so parents can see learning activity clearly and make informed decisions."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  What you can track
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge label="Upcoming lessons" tone="info" />
                  <StatusBadge label="Homework" tone="warning" />
                  <StatusBadge label="Tutor notes" tone="neutral" />
                  <StatusBadge label="Attendance" tone="success" />
                  <StatusBadge label="Progress reports" tone="info" />
                  <StatusBadge label="Payment status" tone="neutral" />
                </div>
                <p className="mt-4 text-sm text-text-secondary">
                  You move from &ldquo;I hope this is helping&rdquo; to &ldquo;I can see
                  what is working and what we should do next.&rdquo;
                </p>
              </CardContent>
            </Card>
            <Card className="border-royal-blue/20 bg-soft-blue/35 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-deep-navy">
                  Built for parent confidence
                </h3>
                <p className="mt-3 text-sm text-text-secondary">
                  TopMox is focused on giving parents clarity, not noise. You get
                  structured visibility so conversations at home become more
                  supportive and less stressful.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-8 rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-white to-soft-cream p-6 shadow-soft md:p-10">
          <SectionHeader
            eyebrow="Diaspora Families"
            title="Structured support for parents in Nigeria and abroad."
            description="For parents in the UK, US, Canada, Europe, UAE, and beyond, TopMox Global Tutoring provides structured academic support from educators who understand discipline, cultural context, and parent expectations."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <OfferBenefitCard
              icon={Globe2}
              title="Global access"
              description="Online tutoring format designed to support families across time zones."
            />
            <OfferBenefitCard
              icon={MapPinned}
              title="Context-aware support"
              description="Educators focus on practical support that aligns with parent expectations and routines."
            />
            <OfferBenefitCard
              icon={HeartHandshake}
              title="Reliable communication"
              description="Parents stay informed through clear updates and regular progress visibility."
            />
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Tutoring Plans"
            title="Choose a plan after a clear assessment."
            description="Recommendations are based on your child's learning needs, support pace, and academic goals."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PlanPreviewCard
              name="Starter Support"
              bestFor="Children who need consistent weekly reinforcement."
              sessionsPerWeek={2}
              coreValue="Stable structure and confidence building."
            />
            <PlanPreviewCard
              name="Growth Plan"
              bestFor="Children who need stronger learning momentum."
              sessionsPerWeek={3}
              coreValue="Balanced acceleration and accountability."
            />
            <PlanPreviewCard
              name="Exam Prep Intensive"
              bestFor="Learners preparing for major assessments."
              sessionsPerWeek={4}
              coreValue="Focused preparation and performance discipline."
            />
            <PlanPreviewCard
              name="Homework Club"
              bestFor="Parents who want guided homework consistency."
              sessionsPerWeek={2}
              coreValue="Reduced homework stress and better follow-through."
            />
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="What Parents Can Expect"
            title="A structured experience from first conversation to progress visibility."
            description="TopMox is built to support families with process, consistency, and clear communication."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <OfferBenefitCard
              icon={ClipboardCheck}
              title="Clear assessment"
              description="A structured starting point to identify support needs."
            />
            <OfferBenefitCard
              icon={Compass}
              title="Structured plan"
              description="A focused recommendation built around your child."
            />
            <OfferBenefitCard
              icon={GraduationCap}
              title="Consistent lessons"
              description="Scheduled tutor support with academic discipline."
            />
            <OfferBenefitCard
              icon={BarChart3}
              title="Progress visibility"
              description="Reports and updates that show what is improving."
            />
            <OfferBenefitCard
              icon={NotebookPen}
              title="Parent communication"
              description="Practical guidance and clearer next steps for home support."
            />
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="FAQ"
            title="Questions parents ask before they begin."
            description="If you need clarity before booking, start here."
          />
          <FAQSection
            items={[
              {
                question: "How does TopMox Global Tutoring work?",
                answer:
                  "You begin with a child assessment, receive a learning recommendation, start online lessons, and track progress through structured updates."
              },
              {
                question: "Is this only for children in Nigeria?",
                answer:
                  "No. TopMox supports families in Nigeria and across diaspora locations including the UK, US, Canada, Europe, UAE, and beyond."
              },
              {
                question: "How do you know what my child needs?",
                answer:
                  "We begin with a structured assessment to understand challenges, current level, and support priorities before recommending a plan."
              },
              {
                question: "Can my child learn from outside Nigeria?",
                answer:
                  "Yes. Lessons are delivered online with scheduling built to support different locations and time zones."
              },
              {
                question: "Will I receive progress updates?",
                answer:
                  "Yes. Parents can expect lesson visibility, homework context, tutor notes, and periodic progress reporting."
              },
              {
                question: "How do I start?",
                answer:
                  "Book a child assessment. That first step gives you clearer direction on what support your child needs next."
              }
            ]}
          />
        </section>

        <CTASection
          title="Start with a child assessment. Leave with a clearer learning direction."
          description="TopMox Global Tutoring is focused on helping your family move from uncertainty to a structured academic support plan."
          primaryHref="/book-assessment"
          secondaryHref="/pricing"
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "TopMox Global Tutoring | School-Backed Online Tutoring for Children",
  description:
    "Structured online tutoring from TopMox Schools for children in Nigeria and abroad, with assessments, live lessons, parent visibility, and progress reports."
};
