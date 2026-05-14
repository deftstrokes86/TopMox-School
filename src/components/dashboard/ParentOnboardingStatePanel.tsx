"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppRole } from "@/lib/auth/types";
import {
  getParentOnboardingStatusAction,
  type ParentOnboardingStatusActionResult
} from "@/server/actions/parent.actions";

type ParentOnboardingStatePanelProps = {
  userName: string;
  userEmail: string;
  role: AppRole;
};

type OnboardingState = NonNullable<ParentOnboardingStatusActionResult["data"]>;

function getOnboardingContent(state: OnboardingState) {
  if (!state.hasParentProfile) {
    return {
      title: "Complete your parent profile",
      description:
        "Add your contact and timezone details so TopMox can coordinate support around your family.",
      ctaLabel: "Complete Parent Profile",
      ctaHref: "/parent/onboarding"
    };
  }

  if (!state.hasChildren) {
    return {
      title: "Add your child profile",
      description:
        "Your parent profile is saved. Next, add your child details so we can prepare the right academic support.",
      ctaLabel: "Add Child Profile",
      ctaHref: "/parent/children"
    };
  }

  return {
    title: "Your family profile is ready",
    description:
      "Your family profile is ready. Next, you can request a child assessment.",
    ctaLabel: "Book a Child Assessment",
    ctaHref: "/book-assessment"
  };
}

export function ParentOnboardingStatePanel({
  userName,
  userEmail,
  role
}: ParentOnboardingStatePanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadState = async () => {
      try {
        const result = await getParentOnboardingStatusAction();

        if (!mounted) {
          return;
        }

        if (!result.success || !result.data) {
          setError(result.message || "Unable to load onboarding status.");
          return;
        }

        setState(result.data);
      } catch {
        if (mounted) {
          setError("Unable to load onboarding status right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadState();

    return () => {
      mounted = false;
    };
  }, []);

  const content = state ? getOnboardingContent(state) : null;

  return (
    <section className="space-y-5">
      <PageHeader
        title="Parent Dashboard"
        description="Your parent dashboard will show your child profiles, assessments, lessons, homework, payments, and progress reports."
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg text-text-primary">
            Signed-in Account
          </CardTitle>
          <p className="text-sm text-text-secondary">
            This area is protected and personalized for your account.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Name
              </p>
              <p className="mt-1 font-medium text-text-primary">{userName}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-soft-cream/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Email
              </p>
              <p className="mt-1 font-medium text-text-primary">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Current Role:
            </span>
            <StatusBadge label={role} tone="info" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-royal-blue/20 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg text-deep-navy">
            Onboarding Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="inline-flex items-center text-sm text-text-secondary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking your onboarding status...
            </p>
          ) : null}

          {!loading && error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {!loading && !error && content ? (
            <div className="rounded-xl border border-border/80 bg-soft-cream/35 p-4">
              <p className="text-base font-semibold text-deep-navy">
                {content.title}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {content.description}
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href={content.ctaHref}>
                    {content.ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
