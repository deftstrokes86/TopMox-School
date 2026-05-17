import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createResourceSchema } from "@/lib/validations/resource.schema";
import {
  buildAdminResourceListItem,
  buildAdminResourceSummary,
  buildPublicResourceDetailView,
  buildResourceFormInitialValues,
  filterPublicResourcesForDisplay,
  getAdminResourceRouteAccess,
  getAdminResourceStatusActions,
  getResourceStatusMeta,
  type ResourceUiRecord
} from "@/lib/utils/resource-ui";

const createdAt = new Date("2026-02-01T10:00:00.000Z");
const updatedAt = new Date("2026-02-03T10:00:00.000Z");

const publishedResource: ResourceUiRecord = {
  id: "published-resource",
  title: "How to Choose Online Tutoring",
  slug: "how-to-choose-online-tutoring",
  excerpt: "A practical parent guide to choosing structured support.",
  content:
    "Start with the child's needs.\n\nUse assessment details to choose the right plan.",
  category: "Parent Guidance",
  status: "PUBLISHED",
  createdAt,
  updatedAt,
  author: {
    id: "admin-user",
    name: "Admin User",
    email: "admin@topmox.test"
  }
};

const draftResource: ResourceUiRecord = {
  ...publishedResource,
  id: "draft-resource",
  title: "Draft Resource",
  slug: "draft-resource",
  status: "DRAFT"
};

const archivedResource: ResourceUiRecord = {
  ...publishedResource,
  id: "archived-resource",
  title: "Archived Resource",
  slug: "archived-resource",
  status: "ARCHIVED"
};

describe("admin resource UI model", () => {
  test("admin resources page lists resources", () => {
    const item = buildAdminResourceListItem(publishedResource);

    assert.equal(item.title, "How to Choose Online Tutoring");
    assert.equal(item.category, "Parent Guidance");
    assert.equal(item.status.label, "Published");
    assert.equal(item.authorName, "Admin User");
    assert.equal(item.viewHref, "/admin/resources/published-resource");
    assert.equal(item.editHref, "/admin/resources/published-resource/edit");
  });

  test("admin can open resource detail", () => {
    const item = buildAdminResourceListItem(draftResource);

    assert.equal(item.viewHref, "/admin/resources/draft-resource");
  });

  test("admin create form requires title, slug, excerpt, content, and category", () => {
    const result = createResourceSchema.safeParse({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: ""
    });

    assert.equal(result.success, false);
  });

  test("admin edit form loads existing resource", () => {
    const values = buildResourceFormInitialValues(publishedResource);

    assert.deepEqual(values, {
      title: publishedResource.title,
      slug: publishedResource.slug,
      excerpt: publishedResource.excerpt,
      content: publishedResource.content,
      category: publishedResource.category,
      status: "PUBLISHED"
    });
  });

  test("admin can publish draft resource", () => {
    assert.deepEqual(getAdminResourceStatusActions("DRAFT"), {
      canPublish: true,
      canArchive: true
    });
  });

  test("admin can archive resource", () => {
    assert.equal(getAdminResourceStatusActions("PUBLISHED").canArchive, true);
  });

  test("admin summary counts draft, published, and archived resources", () => {
    assert.deepEqual(
      buildAdminResourceSummary([
        publishedResource,
        draftResource,
        archivedResource
      ]),
      {
        draft: 1,
        published: 1,
        archived: 1
      }
    );
  });

  test("non-admin cannot access admin resource routes", () => {
    assert.deepEqual(getAdminResourceRouteAccess("PARENT"), {
      canAccess: false,
      redirectTo: "/parent"
    });
    assert.deepEqual(getAdminResourceRouteAccess("TUTOR"), {
      canAccess: false,
      redirectTo: "/tutor"
    });
    assert.deepEqual(getAdminResourceRouteAccess("ADMIN"), {
      canAccess: true,
      redirectTo: null
    });
  });
});

describe("public resource UI model", () => {
  test("/resources shows published resources", () => {
    const resources = filterPublicResourcesForDisplay([
      publishedResource,
      draftResource,
      archivedResource
    ]);

    assert.deepEqual(
      resources.map((resource) => resource.title),
      ["How to Choose Online Tutoring"]
    );
    assert.equal(resources[0]?.href, "/resources/how-to-choose-online-tutoring");
  });

  test("/resources does not show draft resources", () => {
    const resources = filterPublicResourcesForDisplay([draftResource]);

    assert.equal(resources.length, 0);
  });

  test("/resources does not show archived resources", () => {
    const resources = filterPublicResourcesForDisplay([archivedResource]);

    assert.equal(resources.length, 0);
  });

  test("/resources/[slug] renders published resource", () => {
    const detail = buildPublicResourceDetailView(publishedResource);

    assert.equal(detail?.title, publishedResource.title);
    assert.deepEqual(detail?.paragraphs, [
      "Start with the child's needs.",
      "Use assessment details to choose the right plan."
    ]);
  });

  test("/resources/[slug] returns not found for draft or archived resource", () => {
    assert.equal(buildPublicResourceDetailView(draftResource), null);
    assert.equal(buildPublicResourceDetailView(archivedResource), null);
  });

  test("status metadata is readable for resource badges", () => {
    assert.deepEqual(getResourceStatusMeta("ARCHIVED"), {
      label: "Archived",
      tone: "neutral"
    });
  });
});
