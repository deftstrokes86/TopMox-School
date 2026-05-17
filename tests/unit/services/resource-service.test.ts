import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ResourceAccessError,
  ResourceSlugError,
  archiveResource,
  assertCanManageResources,
  assertResourceSlugIsUnique,
  createResource,
  getPublishedResources,
  getPublicResourceBySlug,
  normalizeResourceSlug,
  publishResource,
  updateResource
} from "@/server/services/resource.service";

const resourceInput = {
  title: "How Online Tutoring Works",
  slug: "How Online Tutoring Works!",
  excerpt: "A practical guide for parents considering online tutoring.",
  content: "Online tutoring works best when the learning path is structured.",
  category: "Parent Guidance"
};

describe("resource slug handling", () => {
  test("normalizeResourceSlug converts title-style slug into URL-safe slug", () => {
    assert.equal(
      normalizeResourceSlug(" How Online Tutoring Works! "),
      "how-online-tutoring-works"
    );
  });

  test("duplicate slug is blocked", async () => {
    const client = {
      resource: {
        findFirst: async () => ({ id: "existing-resource" })
      }
    };

    await assert.rejects(
      () => assertResourceSlugIsUnique(client, "existing-slug"),
      ResourceSlugError
    );
  });
});

describe("resource access rules", () => {
  test("admin can create, update, publish, and archive resources", () => {
    assert.doesNotThrow(() => assertCanManageResources("ADMIN"));
  });

  test("parent cannot create resource", () => {
    assert.throws(() => assertCanManageResources("PARENT"), ResourceAccessError);
  });

  test("tutor cannot create resource", () => {
    assert.throws(() => assertCanManageResources("TUTOR"), ResourceAccessError);
  });
});

describe("resource service mutations", () => {
  test("createResource creates a draft resource with normalized slug and author", async () => {
    const calls: unknown[] = [];
    const client = {
      resource: {
        findFirst: async () => null,
        create: async (input: unknown) => {
          calls.push(input);
          return { id: "resource-id" };
        }
      }
    };

    const result = await createResource(client, {
      ...resourceInput,
      authorId: "admin-user-id"
    });

    assert.deepEqual(result, { id: "resource-id" });
    assert.deepEqual(calls, [
      {
        data: {
          title: resourceInput.title,
          slug: "how-online-tutoring-works",
          excerpt: resourceInput.excerpt,
          content: resourceInput.content,
          category: resourceInput.category,
          status: "DRAFT",
          authorId: "admin-user-id"
        },
        select: { id: true, slug: true, status: true }
      }
    ]);
  });

  test("updateResource updates content and checks slug uniqueness excluding itself", async () => {
    const calls: unknown[] = [];
    const client = {
      resource: {
        findFirst: async (input: unknown) => {
          calls.push(input);
          return null;
        },
        update: async (input: unknown) => {
          calls.push(input);
          return { id: "resource-id", status: "DRAFT" };
        }
      }
    };

    const result = await updateResource(client, {
      resourceId: "resource-id",
      ...resourceInput,
      slug: "Updated Resource Slug",
      status: "DRAFT"
    });

    assert.deepEqual(result, { id: "resource-id", status: "DRAFT" });
    assert.deepEqual(calls[0], {
      where: {
        slug: "updated-resource-slug",
        NOT: {
          id: "resource-id"
        }
      },
      select: { id: true }
    });
  });

  test("publishResource sets resource status to PUBLISHED", async () => {
    const calls: unknown[] = [];
    const client = {
      resource: {
        update: async (input: unknown) => {
          calls.push(input);
          return { id: "resource-id", status: "PUBLISHED" };
        }
      }
    };

    await publishResource(client, "resource-id");

    assert.deepEqual(calls, [
      {
        where: { id: "resource-id" },
        data: { status: "PUBLISHED" },
        select: { id: true, slug: true, status: true }
      }
    ]);
  });

  test("archiveResource archives instead of deleting", async () => {
    const calls: unknown[] = [];
    const client = {
      resource: {
        update: async (input: unknown) => {
          calls.push(input);
          return { id: "resource-id", status: "ARCHIVED" };
        }
      }
    };

    await archiveResource(client, "resource-id");

    assert.deepEqual(calls, [
      {
        where: { id: "resource-id" },
        data: { status: "ARCHIVED" },
        select: { id: true, slug: true, status: true }
      }
    ]);
  });
});

describe("public resource visibility", () => {
  test("published resource is publicly visible by slug", async () => {
    const calls: unknown[] = [];
    const client = {
      resource: {
        findFirst: async (input: unknown) => {
          calls.push(input);
          return { id: "resource-id", status: "PUBLISHED" };
        }
      }
    };

    const resource = await getPublicResourceBySlug(client, "Resource Slug");

    assert.deepEqual(resource, { id: "resource-id", status: "PUBLISHED" });
    assert.deepEqual(calls, [
      {
        where: {
          slug: "resource-slug",
          status: "PUBLISHED"
        },
        select: expectPublicResourceSelect()
      }
    ]);
  });

  test("public resources query returns only published resources", async () => {
    const calls: unknown[] = [];
    const client = {
      resource: {
        findMany: async (input: unknown) => {
          calls.push(input);
          return [{ id: "published-resource" }];
        }
      }
    };

    const resources = await getPublishedResources(client);

    assert.deepEqual(resources, [{ id: "published-resource" }]);
    assert.deepEqual(calls, [
      {
        where: { status: "PUBLISHED" },
        select: expectPublicResourceSelect(),
        orderBy: { updatedAt: "desc" }
      }
    ]);
  });
});

function expectPublicResourceSelect() {
  return {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    category: true,
    status: true,
    createdAt: true,
    updatedAt: true
  };
}
