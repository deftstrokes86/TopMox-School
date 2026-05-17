import type { Prisma, ResourceStatus, Role } from "@prisma/client";

import { db } from "@/lib/db";

type ResourceFindFirstClient = {
  resource: {
    findFirst: (args: Prisma.ResourceFindFirstArgs) => Promise<unknown>;
  };
};

type ResourceFindManyClient = {
  resource: {
    findMany: (args: Prisma.ResourceFindManyArgs) => Promise<unknown>;
  };
};

type ResourceCreateClient = {
  resource: {
    create: (args: Prisma.ResourceCreateArgs) => Promise<unknown>;
  };
};

type ResourceUpdateClient = {
  resource: {
    update: (args: Prisma.ResourceUpdateArgs) => Promise<unknown>;
  };
};

export class ResourceAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceAccessError";
  }
}

export class ResourceSlugError extends Error {
  constructor(slug: string) {
    super(`A resource with slug "${slug}" already exists.`);
    this.name = "ResourceSlugError";
  }
}

export const publicResourceSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  category: true,
  status: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.ResourceSelect;

const resourceMutationSelect = {
  id: true,
  slug: true,
  status: true
} satisfies Prisma.ResourceSelect;

export type CreateResourceServiceInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status?: ResourceStatus;
  authorId?: string;
};

export type UpdateResourceServiceInput = CreateResourceServiceInput & {
  resourceId: string;
  status: ResourceStatus;
};

export function normalizeResourceSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function assertCanManageResources(role: Role): void {
  if (role !== "ADMIN") {
    throw new ResourceAccessError("Only admins can manage resources.");
  }
}

export async function assertResourceSlugIsUnique(
  client: ResourceFindFirstClient,
  slug: string,
  resourceId?: string
): Promise<void> {
  const existing = await client.resource.findFirst({
    where: {
      slug,
      ...(resourceId
        ? {
            NOT: {
              id: resourceId
            }
          }
        : {})
    },
    select: {
      id: true
    }
  });

  if (existing) {
    throw new ResourceSlugError(slug);
  }
}

function buildResourceData(input: CreateResourceServiceInput) {
  return {
    title: input.title.trim(),
    slug: normalizeResourceSlug(input.slug),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    category: input.category.trim(),
    status: input.status ?? "DRAFT",
    ...(input.authorId ? { authorId: input.authorId } : {})
  };
}

export async function createResource(
  client: ResourceFindFirstClient & ResourceCreateClient = db,
  input: CreateResourceServiceInput
) {
  const data = buildResourceData(input);
  await assertResourceSlugIsUnique(client, data.slug);

  return client.resource.create({
    data,
    select: resourceMutationSelect
  });
}

export async function updateResource(
  client: ResourceFindFirstClient & ResourceUpdateClient = db,
  input: UpdateResourceServiceInput
) {
  const data = buildResourceData(input);
  await assertResourceSlugIsUnique(client, data.slug, input.resourceId);

  return client.resource.update({
    where: {
      id: input.resourceId
    },
    data,
    select: resourceMutationSelect
  });
}

export async function publishResource(
  client: ResourceUpdateClient = db,
  resourceId: string
) {
  return client.resource.update({
    where: {
      id: resourceId
    },
    data: {
      status: "PUBLISHED"
    },
    select: resourceMutationSelect
  });
}

export async function archiveResource(
  client: ResourceUpdateClient = db,
  resourceId: string
) {
  return client.resource.update({
    where: {
      id: resourceId
    },
    data: {
      status: "ARCHIVED"
    },
    select: resourceMutationSelect
  });
}

export async function getPublicResourceBySlug(
  client: ResourceFindFirstClient = db,
  slug: string
) {
  return client.resource.findFirst({
    where: {
      slug: normalizeResourceSlug(slug),
      status: "PUBLISHED"
    },
    select: publicResourceSelect
  });
}

export async function getPublishedResources(
  client: ResourceFindManyClient = db,
  options: { take?: number } = {}
) {
  return client.resource.findMany({
    where: {
      status: "PUBLISHED"
    },
    select: publicResourceSelect,
    orderBy: {
      updatedAt: "desc"
    },
    ...(options.take ? { take: options.take } : {})
  });
}
