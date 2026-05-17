import type { Prisma, ResourceStatus } from "@prisma/client";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  normalizeResourceSlug,
  publicResourceSelect
} from "@/server/services/resource.service";

const adminResourceSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  category: true,
  status: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.ResourceSelect;

export type AdminResourceFilters = {
  status?: ResourceStatus;
  category?: string;
  search?: string;
  take?: number;
};

export function buildPublishedResourceWhereInput(
  slug?: string
): Prisma.ResourceWhereInput {
  return {
    ...(slug ? { slug: normalizeResourceSlug(slug) } : {}),
    status: "PUBLISHED"
  };
}

export function buildAdminResourceWhereInput(
  filters: AdminResourceFilters = {}
): Prisma.ResourceWhereInput {
  const where: Prisma.ResourceWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category?.trim()) {
    where.category = filters.category.trim();
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim();
    where.OR = [
      {
        title: {
          contains: query,
          mode: "insensitive"
        }
      },
      {
        excerpt: {
          contains: query,
          mode: "insensitive"
        }
      },
      {
        content: {
          contains: query,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
}

export async function getPublishedResources() {
  return db.resource.findMany({
    where: buildPublishedResourceWhereInput(),
    select: publicResourceSelect,
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function getPublishedResourceBySlug(slug: string) {
  return db.resource.findFirst({
    where: buildPublishedResourceWhereInput(slug),
    select: publicResourceSelect
  });
}

export async function getRecentPublishedResources(limit = 3) {
  return db.resource.findMany({
    where: buildPublishedResourceWhereInput(),
    select: publicResourceSelect,
    orderBy: {
      updatedAt: "desc"
    },
    take: limit
  });
}

export async function getAdminResources(filters: AdminResourceFilters = {}) {
  await requireAdmin();

  return db.resource.findMany({
    where: buildAdminResourceWhereInput(filters),
    select: adminResourceSelect,
    orderBy: {
      updatedAt: "desc"
    },
    ...(filters.take ? { take: filters.take } : {})
  });
}

export async function getAdminResourceById(resourceId: string) {
  await requireAdmin();

  return db.resource.findUnique({
    where: {
      id: resourceId
    },
    select: adminResourceSelect
  });
}
