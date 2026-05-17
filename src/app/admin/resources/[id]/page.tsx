import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit3, FileText } from "lucide-react";

import { ResourceStatusActions } from "@/components/forms/admin/resource-status-actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatResourceContentParagraphs,
  getResourceStatusMeta
} from "@/lib/utils/resource-ui";
import { getAdminResourceById } from "@/server/queries/resource.queries";

export const dynamic = "force-dynamic";

type AdminResourceDetailPageProps = {
  params: {
    id: string;
  };
};

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function DetailTile({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default async function AdminResourceDetailPage({
  params
}: AdminResourceDetailPageProps) {
  const resource = await getAdminResourceById(params.id);

  if (!resource) {
    notFound();
  }

  const status = getResourceStatusMeta(resource.status);
  const paragraphs = formatResourceContentParagraphs(resource.content);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Resource Preview"
        description="Review the parent-facing article, status, and publishing actions before it appears publicly."
        actions={
          <>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/admin/resources">
                <FileText className="mr-2 h-4 w-4" />
                Back to Resources
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/admin/resources/${resource.id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Resource
              </Link>
            </Button>
          </>
        }
      />

      <Card className="border-royal-blue/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl text-deep-navy">
              {resource.title}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {resource.excerpt}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <DetailTile label="Category" value={resource.category} />
          <DetailTile label="Slug" value={resource.slug} />
          <DetailTile
            label="Author"
            value={resource.author?.name ?? resource.author?.email ?? "TopMox Admin"}
          />
          <DetailTile label="Created" value={formatDateTime(resource.createdAt)} />
          <DetailTile label="Updated" value={formatDateTime(resource.updatedAt)} />
          <DetailTile
            label="Public URL"
            value={
              resource.status === "PUBLISHED"
                ? `/resources/${resource.slug}`
                : "Hidden until published"
            }
          />
        </CardContent>
      </Card>

      <Card className="border-warm-gold/25">
        <CardHeader>
          <CardTitle className="text-xl text-deep-navy">
            Publishing Actions
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Published resources are visible to public readers. Archived
            resources stay available to admin but are hidden from the website.
          </p>
        </CardHeader>
        <CardContent>
          <ResourceStatusActions
            resourceId={resource.id}
            status={resource.status}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-white">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal-blue">
            Public Preview
          </p>
          <CardTitle className="text-3xl text-deep-navy">
            {resource.title}
          </CardTitle>
          <p className="text-sm text-text-secondary">{resource.excerpt}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-7 text-text-secondary md:text-base"
            >
              {paragraph}
            </p>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
