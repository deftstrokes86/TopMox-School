import Link from "next/link";
import { FileText } from "lucide-react";

import { ResourceForm } from "@/components/forms/admin/resource-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NewAdminResourcePage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="New Resource"
        description="Draft a parent-facing guide that can be reviewed, saved, and published when ready."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/resources">
              <FileText className="mr-2 h-4 w-4" />
              Back to Resources
            </Link>
          </Button>
        }
      />

      <ResourceForm mode="create" />
    </section>
  );
}
