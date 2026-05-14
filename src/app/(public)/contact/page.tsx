import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircleMore, ShieldCheck } from "lucide-react";

import { AssessmentCTA } from "@/components/marketing/AssessmentCTA";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-12 md:space-y-16">
        <section className="rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] p-7 text-white shadow-lifted md:p-10">
          <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-50">
            Contact TopMox
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Talk to a TopMox coordinator about your child&apos;s support needs
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-50/95 md:text-base">
            If you need direction before booking, reach out. We&apos;ll guide you
            on the right next step and help you start with clarity.
          </p>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Parent Enquiry"
            title="Send your enquiry details"
            description="Share a few details and our team will follow up with practical next steps."
          />
          <Card className="border-border shadow-soft">
            <CardContent className="p-6 md:p-8">
              {/* Placeholder form for Phase 4C; submission wiring is deferred. */}
              <form className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" name="fullName" placeholder="Parent full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp number</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    placeholder="+234 or international format"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" placeholder="Country of residence" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reason">Reason for enquiry</Label>
                  <Input
                    id="reason"
                    name="reason"
                    placeholder="Example: Assessment, subject support, exam prep"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us what support your child currently needs."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="button">Send Enquiry</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Direct Contact"
            title="Reach us on WhatsApp or email"
            description="If you prefer direct communication, use the placeholders below."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft-cream text-royal-blue">
                  <MessageCircleMore className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  WhatsApp
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Placeholder: +234 000 000 0000
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Best for quick parent questions before booking assessment.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-soft">
              <CardContent className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft-cream text-royal-blue">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  Email
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Placeholder: hello@topmox.test
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Best for detailed enquiries about learning needs and support
                  planning.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-7">
          <SectionHeader
            eyebrow="Helpful Next Step"
            title="Most parents start by booking a child assessment"
            description="Assessment helps TopMox identify what support your child needs so your plan recommendation is clearer and more confident."
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
            eyebrow="FAQ Preview"
            title="Have a quick question first?"
            description="Explore common parent questions about process, time zones, subjects, and progress updates."
          />
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-text-secondary">
                Visit the FAQ page for practical answers and clear next-step
                guidance.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/faq">Open FAQ</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-royal-blue/20 bg-soft-blue/35 shadow-soft">
            <CardContent className="p-6 md:p-8">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-royal-blue">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-text-primary md:text-2xl">
                Trusted, school-backed support
              </h2>
              <p className="mt-3 text-sm text-text-secondary md:text-base">
                TopMox Global Tutoring is designed to support families with
                structure, communication, and progress visibility so parents can
                make informed decisions with confidence.
              </p>
            </CardContent>
          </Card>
        </section>

        <AssessmentCTA
          title="Start with assessment and get clearer academic direction."
          description="Book a child assessment so TopMox can guide your family with structured recommendations and practical next steps."
        />
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Contact | TopMox Global Tutoring",
  description:
    "Contact TopMox Global Tutoring to ask parent questions and begin with a child assessment for structured support direction."
};
