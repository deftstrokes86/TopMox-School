import type { ResourceStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, FileText, Plus, Search } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildAdminResourceListItem,
  buildAdminResourceSummary,
  getResourceStatusMeta,
  type ResourceUiRecord
} from "@/lib/utils/resource-ui";
import { getAdminResources } from "@/server/queries/resource.queries";

export const dynamic = "force-dynamic";

const resourceStatuses: ResourceStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

type AdminResourcesPageProps = {
  searchParams: {
    status?: string;
    search?: string;
    category?: string;
  };
};

function parseStatus(value?: string): ResourceStatus | undefined {
  return resourceStatuses.includes(value as ResourceStatus)
    ? (value as ResourceStatus)
    : undefined;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(value);
}

function FilterControls({
  searchParams
}: {
  searchParams: AdminResourcesPageProps["searchParams"];
}) {
  return (
    <Card className="border-royal-blue/20">
      <CardContent className="p-5">
        <form
          className="grid gap-3 lg:grid-cols-[1fr_0.7fr_0.8fr_auto]"
          action="/admin/resources"
        >
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Title or content
            </span>
            <input
              name="search"
              defaultValue={searchParams.search ?? ""}
              placeholder="Search resources"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Status
            </span>
            <select
              name="status"
              defaultValue={searchParams.status ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All statuses</option>
              {resourceStatuses.map((status) => (
                <option key={status} value={status}>
                  {getResourceStatusMeta(status).label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Category
            </span>
            <input
              name="category"
              defaultValue={searchParams.category ?? ""}
              placeholder="Optional exact category"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full lg:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button asChild variant="outline" className="w-full lg:w-auto">
              <Link href="/admin/resources">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ResourceRow({ resource }: { resource: ResourceUiRecord }) {
  const item = buildAdminResourceListItem(resource);

  return (
    <Card className="border-border/80 bg-white">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {item.title}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {item.category} | {item.authorName}
            </p>
          </div>
          <StatusBadge label={item.status.label} tone={item.status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
          {item.excerpt}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Slug
            </p>
            <p className="mt-1 break-all text-sm font-medium text-text-primary">
              {item.slug}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Created
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(item.createdAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              Updated
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {formatDate(item.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={item.editHref}>Edit</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={item.viewHref}>
              View
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminResourcesPage({
  searchParams
}: AdminResourcesPageProps) {
  const [resources, allResources] = await Promise.all([
    getAdminResources({
      status: parseStatus(searchParams.status),
      category: searchParams.category || undefined,
      search: searchParams.search || undefined
    }),
    getAdminResources()
  ]);
  const summary = buildAdminResourceSummary(allResources);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Resources"
        description="Manage educational resources for parents and SEO visibility."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/resources/new">
              <Plus className="mr-2 h-4 w-4" />
              New Resource
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Draft"
          value={String(summary.draft)}
          context="Resources still being prepared."
        />
        <StatCard
          label="Published"
          value={String(summary.published)}
          context="Resources visible on the public website."
        />
        <StatCard
          label="Archived"
          value={String(summary.archived)}
          context="Resources hidden without being deleted."
        />
      </div>

      <FilterControls searchParams={searchParams} />

      {resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="Create draft parent guides, publish approved resources, and archive content that should no longer appear publicly."
          action={
            <Button asChild>
              <Link href="/admin/resources/new">
                <FileText className="mr-2 h-4 w-4" />
                Create Resource
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </section>
  );
}
