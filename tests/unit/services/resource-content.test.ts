import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  DEFAULT_RESOURCES,
  REQUIRED_RESOURCE_TITLES
} from "@/lib/resources/default-resources";
import { createResourceSchema } from "@/lib/validations/resource.schema";
import { buildPublicResourceDetailView } from "@/lib/utils/resource-ui";
import { normalizeResourceSlug } from "@/server/services/resource.service";

const forbiddenContentPatterns = [
  /lorem ipsum/i,
  /guaranteed (grades?|results?|success)/i,
  /instant improvement/i,
  /miracle/i
];

describe("default resource content QA", () => {
  test("seed resources include the required parent education articles", () => {
    const titles = DEFAULT_RESOURCES.map((resource) => resource.title);

    assert.deepEqual(titles.sort(), [...REQUIRED_RESOURCE_TITLES].sort());
  });

  test("default resources are valid published resource records", () => {
    for (const resource of DEFAULT_RESOURCES) {
      assert.equal(resource.status, "PUBLISHED");
      assert.equal(resource.slug, normalizeResourceSlug(resource.slug));
      assert.equal(createResourceSchema.safeParse(resource).success, true);
    }
  });

  test("default resource content is useful, parent-friendly, and not filler", () => {
    for (const resource of DEFAULT_RESOURCES) {
      assert.ok(
        resource.excerpt.length >= 70,
        `${resource.title} should have a useful excerpt`
      );
      assert.ok(
        resource.content.length >= 700,
        `${resource.title} should have enough article depth for demo`
      );

      for (const pattern of forbiddenContentPatterns) {
        assert.doesNotMatch(resource.content, pattern);
      }
    }
  });

  test("default resources stay aligned with the assessment-first offer", () => {
    const combinedCopy = DEFAULT_RESOURCES.map(
      (resource) => `${resource.excerpt}\n${resource.content}`
    )
      .join("\n")
      .toLowerCase();

    assert.match(combinedCopy, /assessment/);
    assert.match(combinedCopy, /structured/);
    assert.match(combinedCopy, /progress/);
  });

  test("default published resources can render public detail pages", () => {
    const [resource] = DEFAULT_RESOURCES;
    const detail = buildPublicResourceDetailView({
      ...resource,
      id: "default-resource",
      createdAt: new Date("2026-05-17T00:00:00.000Z"),
      updatedAt: new Date("2026-05-17T00:00:00.000Z")
    });

    assert.equal(detail?.href, `/resources/${resource.slug}`);
    assert.ok((detail?.paragraphs.length ?? 0) >= 4);
  });
});
