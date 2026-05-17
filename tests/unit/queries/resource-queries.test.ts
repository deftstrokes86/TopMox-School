import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildAdminResourceWhereInput,
  buildPublishedResourceWhereInput
} from "@/server/queries/resource.queries";

describe("resource query visibility filters", () => {
  test("public query returns only published resources", () => {
    assert.deepEqual(buildPublishedResourceWhereInput(), {
      status: "PUBLISHED"
    });
  });

  test("draft resources are hidden publicly", () => {
    assert.notDeepEqual(buildPublishedResourceWhereInput(), {
      status: "DRAFT"
    });
  });

  test("archived resources are hidden publicly", () => {
    assert.notDeepEqual(buildPublishedResourceWhereInput(), {
      status: "ARCHIVED"
    });
  });

  test("public resource detail query includes slug and published status", () => {
    assert.deepEqual(buildPublishedResourceWhereInput("Parent Guide"), {
      slug: "parent-guide",
      status: "PUBLISHED"
    });
  });

  test("admin query can include draft, published, and archived resources", () => {
    assert.deepEqual(
      buildAdminResourceWhereInput({
        status: "ARCHIVED",
        category: "Parent Guidance",
        search: "reading"
      }),
      {
        status: "ARCHIVED",
        category: "Parent Guidance",
        OR: [
          {
            title: {
              contains: "reading",
              mode: "insensitive"
            }
          },
          {
            excerpt: {
              contains: "reading",
              mode: "insensitive"
            }
          },
          {
            content: {
              contains: "reading",
              mode: "insensitive"
            }
          }
        ]
      }
    );
  });
});
