import { redirect } from "next/navigation";

import { ChildProfileForm } from "@/components/forms/parent/child-profile-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getParentOnboardingStatus } from "@/server/queries/parent.queries";

export const dynamic = "force-dynamic";

export default async function NewChildProfilePage() {
  const onboardingStatus = await getParentOnboardingStatus();

  if (!onboardingStatus.hasParentProfile) {
    redirect("/parent/onboarding");
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Create Child Profile"
        description="Let's capture your child's learning details so TopMox can prepare structured support and recommend the right academic path."
      />

      <Card className="border-royal-blue/20 shadow-soft">
        <CardContent className="p-6 md:p-8">
          <ChildProfileForm mode="create" />
        </CardContent>
      </Card>
    </section>
  );
}
