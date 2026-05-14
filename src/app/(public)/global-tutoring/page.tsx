import type { Metadata } from "next";
import {
  Clock3,
  Compass,
  Eye,
  Handshake,
  MapPinned,
  School,
  ShieldCheck,
  Users
} from "lucide-react";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { HeroShell } from "@/components/marketing/HeroShell";
import { OfferBenefitCard } from "@/components/marketing/OfferBenefitCard";
import { ProcessStepCard } from "@/components/marketing/ProcessStepCard";
import { RegionSupportCard } from "@/components/marketing/RegionSupportCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalTutoringPage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <HeroShell
          title="Global tutoring support for parents in Nigeria and abroad."
          subtitle="TopMox Global Tutoring is built for families who want structure, visibility, and consistent academic support without guessing what to do next."
          trustMicrocopy="School-backed support powered by TopMox Schools"
          benefitChips={[
            "Assessment-first clarity",
            "Experienced educators",
            "Timezone-friendly scheduling",
            "Parent progress visibility"
          ]}
        />

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Why Parents Choose TopMox"
            title="Clarity, structure, and confidence for families across locations"
            description="Parents choose TopMox when they want reliable support that is designed to help children improve while keeping parents informed."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OfferBenefitCard
              icon={Compass}
              title="Faster direction"
              description="Start with assessment so you quickly understand where support is needed most."
            />
            <OfferBenefitCard
              icon={ShieldCheck}
              title="More certainty"
              description="A school-backed process gives families confidence in how learning support is delivered."
            />
            <OfferBenefitCard
              icon={Handshake}
              title="Lower parent burden"
              description="TopMox guides assessment, recommendation, tutor pairing, and lesson rhythm."
            />
            <OfferBenefitCard
              icon={Eye}
              title="Clear visibility"
              description="You can follow progress through lessons, homework, notes, and reports."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Who This Is For"
            title="For parents who want support without guesswork"
            description="TopMox Global Tutoring is designed for families who want structured academic support and practical communication."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  Parent priorities we support
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                  <li>Children who need clearer learning direction</li>
                  <li>Families seeking discipline and consistent study rhythm</li>
                  <li>Parents who want regular updates and visible progress</li>
                  <li>Families balancing school demands across different locations</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  Supported learning needs
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                  <li>Foundational gaps in core subjects</li>
                  <li>Homework consistency and accountability</li>
                  <li>Exam-focused preparation support</li>
                  <li>Confidence and learning momentum recovery</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Timezone Flexibility"
            title="Flexible online lesson scheduling across regions"
            description="Scheduling is structured to support family routines in Nigeria and diaspora locations."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <OfferBenefitCard
              icon={Clock3}
              title="Coordinated scheduling"
              description="Lesson timing is planned around practical availability windows for families."
            />
            <OfferBenefitCard
              icon={MapPinned}
              title="Cross-region support"
              description="TopMox supports parents across Nigeria, UK, North America, Europe, UAE, and other diaspora locations."
            />
            <OfferBenefitCard
              icon={Users}
              title="Family-friendly rhythm"
              description="Session cadence is structured to reduce pressure and improve consistency."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="School-Backed Structure"
            title="Built as a guided academic support system"
            description="TopMox is not random tutoring. It is focused on structured diagnosis, guided planning, and progress visibility."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OfferBenefitCard
              icon={School}
              title="Backed by TopMox Schools"
              description="Families engage with an established education brand and process."
            />
            <OfferBenefitCard
              icon={Compass}
              title="Assessment before recommendations"
              description="Support starts with academic context, not assumptions."
            />
            <OfferBenefitCard
              icon={Handshake}
              title="Guided tutor support"
              description="TopMox helps align the right tutor support to identified needs."
            />
            <OfferBenefitCard
              icon={Eye}
              title="Structured parent updates"
              description="Parents can track what is happening and what comes next."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Assessment-First Process"
            title="Simple path from uncertainty to a clear plan"
            description="The process is designed for speed to value and reduced parent effort."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProcessStepCard
              step="Step 1"
              title="Book a Child Assessment"
              description="Share your child's profile and main concerns."
            />
            <ProcessStepCard
              step="Step 2"
              title="Receive Learning Recommendation"
              description="Get a support direction based on the assessment findings."
            />
            <ProcessStepCard
              step="Step 3"
              title="Start Lessons"
              description="Begin structured online lessons with a TopMox educator."
            />
            <ProcessStepCard
              step="Step 4"
              title="Track Progress"
              description="Follow lessons, homework, notes, and periodic reporting."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Regions Served"
            title="Designed for families in Nigeria and diaspora communities"
            description="TopMox supports families across multiple regions while staying responsible about curriculum scope and learner needs."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RegionSupportCard
              region="Nigeria"
              detail="Structured online support for families seeking consistency and accountability."
            />
            <RegionSupportCard
              region="United Kingdom"
              detail="Flexible tutoring support aligned to practical family schedules."
            />
            <RegionSupportCard
              region="United States and Canada"
              detail="Support designed to help parents stay informed across distance and timezone differences."
            />
            <RegionSupportCard
              region="Ireland, Europe, UAE, and other diaspora locations"
              detail="TopMox can support global families through assessment-first planning and parent visibility."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Assessment-first support" tone="info" />
            <StatusBadge label="School-backed process" tone="success" />
            <StatusBadge label="Parent visibility" tone="info" />
            <StatusBadge label="Flexible lesson timing" tone="warning" />
          </div>
        </section>

        <AssessmentCTA
          title="Book a child assessment and get a clearer direction."
          description="TopMox Global Tutoring is built to support your child with structure while helping you become a confident, informed, and proactive parent."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Global Tutoring | TopMox Global Tutoring",
  description:
    "School-backed online tutoring support for families in Nigeria and diaspora locations. Start with a child assessment for structured direction."
};
