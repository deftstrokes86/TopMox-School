import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, FileText } from "lucide-react";

import { ResourceForm } from "@/components/forms/admin/resource-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { buildResourceFormInitialValues } from "@/lib/utils/resource-ui";
import { getAdminResourceById } from "@/server/queries/resource.queries";

export const dynamic = "force-dynamic";

type EditAdminResourcePageProps = {
  params: {
    id: string;
  };
};

export default async function EditAdminResourcePage({
  params
}: EditAdminResourcePageProps) {
  const resource = await getAdminResourceById(params.id);

  if (!resource) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Edit Resource"
        description="Update the article, adjust status, and keep public resource content accurate and parent-friendly."
        actions={
          <>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/resources">
                <FileText className="mr-2 h-4 w-4" />
                Back to Resources
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/admin/resources/${resource.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Preview
              </Link>
            </Button>
          </>
        }
      />

      <ResourceForm
        mode="edit"
        resourceId={resource.id}
        initialValues={buildResourceFormInitialValues(resource)}
      />
    </section>
  );
}
