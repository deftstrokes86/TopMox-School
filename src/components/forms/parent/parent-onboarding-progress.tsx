import Link from "next/link";

import { cn } from "@/lib/utils";

type ParentOnboardingProgressProps = {
  profileSaved?: boolean;
};

export function ParentOnboardingProgress({
  profileSaved = false
}: ParentOnboardingProgressProps) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-royal-blue">
        Onboarding Progress
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-royal-blue/30 bg-soft-blue/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-royal-blue">
            Step 1
          </p>
          <p className="mt-1 text-sm font-semibold text-deep-navy">
            Parent Profile
          </p>
          <p className="mt-1 text-xs text-text-secondary">Current step</p>
        </div>

        <div
          className={cn(
            "rounded-xl border p-4",
            profileSaved
              ? "border-success/30 bg-success/10"
              : "border-border bg-soft-cream/60"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-royal-blue">
            Step 2
          </p>
          <p className="mt-1 text-sm font-semibold text-deep-navy">
            Child Profile
          </p>
          {profileSaved ? (
            <Link
              href="/parent/children"
              className="mt-1 inline-block text-xs font-medium text-royal-blue hover:text-deep-navy"
            >
              Continue to child profile
            </Link>
          ) : (
            <p className="mt-1 text-xs text-text-secondary">
              Available after saving parent profile
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-soft-cream/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-royal-blue">
            Step 3
          </p>
          <p className="mt-1 text-sm font-semibold text-deep-navy">
            Assessment Request
          </p>
          <p className="mt-1 text-xs text-text-secondary">Upcoming step</p>
        </div>
      </div>
    </section>
  );
}
