import type { ResourceStatus, Role } from "@prisma/client";

import type { StatusTone } from "@/lib/constants/statuses";

export type ResourceUiRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: ResourceStatus;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export type ResourceFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: ResourceStatus;
};

export function getResourceStatusMeta(status: ResourceStatus): {
  label: string;
  tone: StatusTone;
} {
  switch (status) {
    case "PUBLISHED":
      return {
        label: "Published",
        tone: "success"
      };
    case "ARCHIVED":
      return {
        label: "Archived",
        tone: "neutral"
      };
    case "DRAFT":
    default:
      return {
        label: "Draft",
        tone: "warning"
      };
  }
}

export function getAdminResourceStatusActions(status: ResourceStatus): {
  canPublish: boolean;
  canArchive: boolean;
} {
  return {
    canPublish: status !== "PUBLISHED",
    canArchive: status !== "ARCHIVED"
  };
}

export function buildAdminResourceListItem(resource: ResourceUiRecord) {
  return {
    id: resource.id,
    title: resource.title,
    slug: resource.slug,
    excerpt: resource.excerpt,
    category: resource.category,
    status: getResourceStatusMeta(resource.status),
    authorName: resource.author?.name ?? resource.author?.email ?? "TopMox Admin",
    updatedAt: resource.updatedAt,
    createdAt: resource.createdAt,
    viewHref: `/admin/resources/${resource.id}`,
    editHref: `/admin/resources/${resource.id}/edit`
  };
}

export function buildAdminResourceSummary(resources: ResourceUiRecord[]): {
  draft: number;
  published: number;
  archived: number;
} {
  return resources.reduce(
    (summary, resource) => {
      if (resource.status === "DRAFT") {
        summary.draft += 1;
      }

      if (resource.status === "PUBLISHED") {
        summary.published += 1;
      }

      if (resource.status === "ARCHIVED") {
        summary.archived += 1;
      }

      return summary;
    },
    {
      draft: 0,
      published: 0,
      archived: 0
    }
  );
}

export function buildResourceFormInitialValues(
  resource?: Partial<ResourceUiRecord> | null
): ResourceFormValues {
  return {
    title: resource?.title ?? "",
    slug: resource?.slug ?? "",
    excerpt: resource?.excerpt ?? "",
    content: resource?.content ?? "",
    category: resource?.category ?? "",
    status: resource?.status ?? "DRAFT"
  };
}

export function getAdminResourceRouteAccess(role?: Role | null): {
  canAccess: boolean;
  redirectTo: string | null;
} {
  if (role === "ADMIN") {
    return {
      canAccess: true,
      redirectTo: null
    };
  }

  if (role === "PARENT") {
    return {
      canAccess: false,
      redirectTo: "/parent"
    };
  }

  if (role === "TUTOR") {
    return {
      canAccess: false,
      redirectTo: "/tutor"
    };
  }

  return {
    canAccess: false,
    redirectTo: "/login"
  };
}

export function formatResourceContentParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function filterPublicResourcesForDisplay(resources: ResourceUiRecord[]) {
  return resources
    .filter((resource) => resource.status === "PUBLISHED")
    .map((resource) => ({
      id: resource.id,
      title: resource.title,
      slug: resource.slug,
      excerpt: resource.excerpt,
      category: resource.category,
      updatedAt: resource.updatedAt,
      href: `/resources/${resource.slug}`
    }));
}

export function buildPublicResourceDetailView(
  resource: ResourceUiRecord | null | undefined
) {
  if (!resource || resource.status !== "PUBLISHED") {
    return null;
  }

  return {
    id: resource.id,
    title: resource.title,
    slug: resource.slug,
    excerpt: resource.excerpt,
    category: resource.category,
    updatedAt: resource.updatedAt,
    paragraphs: formatResourceContentParagraphs(resource.content),
    href: `/resources/${resource.slug}`
  };
}
