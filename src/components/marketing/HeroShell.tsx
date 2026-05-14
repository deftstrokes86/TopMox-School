"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";

type HeroShellProps = {
  title: string;
  subtitle: string;
  trustMicrocopy?: string;
  benefitChips?: string[];
};

const defaultBenefitChips = [
  "Structured learning plans",
  "Experienced educators",
  "Monthly progress reports",
  "Flexible online lessons"
];

export function HeroShell({
  title,
  subtitle,
  trustMicrocopy = "Powered by TopMox Schools",
  benefitChips = defaultBenefitChips
}: HeroShellProps) {
  return (
    <section className="md:py-18 relative overflow-hidden rounded-2xl border border-royal-blue/20 bg-gradient-to-br from-deep-navy via-royal-blue to-[#2f75bf] px-6 py-14 text-white shadow-lifted md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl space-y-5"
      >
        <p className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-50">
          School-backed online tutoring
        </p>
        <h1 className="text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
          {title}
        </h1>
        <p className="text-base text-blue-50/95 md:text-lg">{subtitle}</p>
        <p className="text-sm font-medium text-blue-100">{trustMicrocopy}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-white text-deep-navy hover:bg-white/90"
          >
            <Link href="/book-assessment">{BRAND.PRIMARY_CTA}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/60 bg-white/10 text-white hover:bg-white/20"
          >
            <Link href="/pricing">{BRAND.SECONDARY_CTA}</Link>
          </Button>
        </div>
        <div className="grid gap-2 pt-2 sm:grid-cols-2">
          {benefitChips.map((chip) => (
            <p
              key={chip}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-blue-50/95"
            >
              <CheckCircle2 className="h-4 w-4 text-soft-gold" />
              {chip}
            </p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
