import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createResourceSchema,
  updateResourceSchema,
  updateResourceStatusSchema
} from "@/lib/validations/resource.schema";

const validResource = {
  title: "How to Support Reading at Home",
  slug: "how-to-support-reading-at-home",
  excerpt: "A short parent guide for building stronger reading habits.",
  content: "Reading improves when children practise consistently with guidance.",
  category: "Parent Guidance"
};

describe("resource validation schemas", () => {
  test("resource requires title", () => {
    const result = createResourceSchema.safeParse({
      ...validResource,
      title: ""
    });

    assert.equal(result.success, false);
  });

  test("resource requires slug", () => {
    const result = createResourceSchema.safeParse({
      ...validResource,
      slug: ""
    });

    assert.equal(result.success, false);
  });

  test("resource requires excerpt", () => {
    const result = createResourceSchema.safeParse({
      ...validResource,
      excerpt: ""
    });

    assert.equal(result.success, false);
  });

  test("resource requires content", () => {
    const result = createResourceSchema.safeParse({
      ...validResource,
      content: ""
    });

    assert.equal(result.success, false);
  });

  test("resource requires category", () => {
    const result = createResourceSchema.safeParse({
      ...validResource,
      category: ""
    });

    assert.equal(result.success, false);
  });

  test("slug must be lowercase URL-safe", () => {
    assert.equal(
      createResourceSchema.safeParse({
        ...validResource,
        slug: "Bad Slug!"
      }).success,
      false
    );

    assert.equal(
      createResourceSchema.safeParse({
        ...validResource,
        slug: "good-resource-slug"
      }).success,
      true
    );
  });

  test("status must be valid", () => {
    assert.equal(
      createResourceSchema.safeParse({
        ...validResource,
        status: "LIVE"
      }).success,
      false
    );

    assert.equal(
      updateResourceStatusSchema.safeParse({
        resourceId: "resource-id",
        status: "PUBLISHED"
      }).success,
      true
    );
  });

  test("update resource requires resourceId", () => {
    const result = updateResourceSchema.safeParse({
      ...validResource,
      status: "DRAFT"
    });

    assert.equal(result.success, false);
  });
});
