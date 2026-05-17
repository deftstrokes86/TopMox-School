import { DEFAULT_RESOURCES } from "@/lib/resources/default-resources";
import type { ResourceUiRecord } from "@/lib/utils/resource-ui";
import { normalizeResourceSlug } from "@/server/services/resource.service";

const DEFAULT_RESOURCE_DATE = new Date("2026-05-17T00:00:00.000Z");

export function getDefaultResourceUiRecords(): ResourceUiRecord[] {
  return DEFAULT_RESOURCES.map((resource) => ({
    ...resource,
    id: `default-${resource.slug}`,
    createdAt: DEFAULT_RESOURCE_DATE,
    updatedAt: DEFAULT_RESOURCE_DATE,
    author: {
      id: "topmox-admin",
      name: "TopMox Admin",
      email: "admin@topmox.test"
    }
  }));
}

export function getDefaultResourceUiRecordBySlug(
  slug: string
): ResourceUiRecord | null {
  const normalizedSlug = normalizeResourceSlug(slug);

  return (
    getDefaultResourceUiRecords().find(
      (resource) => resource.slug === normalizedSlug
    ) ?? null
  );
}
