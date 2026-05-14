import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ParentOnboardingForm } from "@/components/forms/parent/parent-onboarding-form";
import { requireDashboardAccess } from "@/lib/auth/dashboard-access";

export default async function ParentOnboardingPage() {
  const user = await requireDashboardAccess("PARENT");

  return (
    <section className="space-y-6">
      <PageHeader
        title="Let's understand how to support your family."
        description="Your parent profile helps TopMox recommend the right learning support, communicate clearly, and coordinate lessons around your location and timezone."
      />

      <Card className="border-royal-blue/20 shadow-soft">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
            <p className="font-medium text-deep-navy">
              Why this information matters
            </p>
            <p className="mt-2">
              TopMox uses your profile details to coordinate communication, align
              lesson timing with your timezone, and guide your family through a
              structured support journey.
            </p>
          </div>

          <ParentOnboardingForm
            defaultFullName={user.name}
            defaultEmail={user.email}
          />
        </CardContent>
      </Card>
    </section>
  );
}
