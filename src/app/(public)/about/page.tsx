import type { Metadata } from "next";
import {
  Compass,
  Eye,
  GraduationCap,
  Handshake,
  School,
  ShieldCheck
} from "lucide-react";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { OfferBenefitCard } from "@/components/marketing/OfferBenefitCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            About TopMox
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            School-backed tutoring built for parent confidence
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            TopMox Global Tutoring extends the educational values of TopMox
            Schools into a structured online tutoring experience for children in
            Nigeria and abroad.
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="About TopMox Schools"
            title="Educational credibility with a global tutoring mission"
            description="TopMox Global Tutoring exists to give families school-backed academic support beyond the classroom, with structure and accountability."
          />
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-text-secondary md:text-base">
                This platform was created for parents who want trusted support,
                not random tutoring. The focus is practical: assess each child,
                recommend a clear learning path, coordinate structured lessons,
                and provide visible progress over time.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Parent Promise"
            title="What TopMox is committed to delivering"
            description="Every part of the tutoring experience is designed to increase clarity, certainty, and parent confidence."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OfferBenefitCard
              icon={Compass}
              title="Structured direction"
              description="Assessment-first recommendations designed to support the right next step."
            />
            <OfferBenefitCard
              icon={GraduationCap}
              title="Experienced educators"
              description="Tutor support focused on consistency, discipline, and practical improvement."
            />
            <OfferBenefitCard
              icon={Eye}
              title="Parent visibility"
              description="Clear lesson, homework, and reporting visibility to reduce uncertainty."
            />
            <OfferBenefitCard
              icon={Handshake}
              title="Guided support"
              description="TopMox coordinates the process so parents are not left figuring everything out alone."
            />
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="What Makes It Different"
            title="How school-backed tutoring stands apart"
            description="TopMox is built as an academic support system, not one-off tutoring sessions."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  School-backed standards
                </h3>
                <p className="mt-3 text-sm text-text-secondary">
                  TopMox emphasizes learning structure, accountability, and steady
                  academic momentum rather than ad-hoc lessons without context.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-text-primary">
                  Process before promises
                </h3>
                <p className="mt-3 text-sm text-text-secondary">
                  Recommendations are built around assessment and progress
                  visibility, not broad claims or unrealistic guarantees.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Teaching Philosophy"
            title="Structured to help children improve with confidence"
            description="TopMox tutoring is focused on understanding, consistency, and practical parent communication."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <OfferBenefitCard
              icon={ShieldCheck}
              title="Confidence through clarity"
              description="Learners are supported with clear goals and practical reinforcement."
            />
            <OfferBenefitCard
              icon={School}
              title="Discipline through structure"
              description="Lessons and homework follow a rhythm designed to support sustained progress."
            />
            <OfferBenefitCard
              icon={Eye}
              title="Trust through visibility"
              description="Parents can follow what is improving and where support is still needed."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Assessment-first support" tone="info" />
            <StatusBadge label="Monthly progress reports" tone="success" />
            <StatusBadge label="Flexible online lessons" tone="warning" />
            <StatusBadge label="Parent communication" tone="neutral" />
          </div>
        </section>

        <AssessmentCTA
          title="Start with a child assessment and get clear support direction."
          description="TopMox Global Tutoring helps families move from concern to confidence through school-backed structure and visible progress."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "About | TopMox Global Tutoring",
  description:
    "Learn why TopMox Global Tutoring exists, how school-backed tutoring is different, and what parents can expect from a structured support process."
};
