import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getDashboardRedirectPath } from "@/lib/auth/dashboard-access";
import type { AuthUser } from "@/lib/auth/types";

const adminUser: AuthUser = {
  id: "admin-id",
  name: "Admin User",
  email: "admin@topmox.test",
  role: "ADMIN"
};

const parentUser: AuthUser = {
  id: "parent-id",
  name: "Parent User",
  email: "parent@topmox.test",
  role: "PARENT"
};

describe("getDashboardRedirectPath", () => {
  test("redirects unauthenticated users to /login", () => {
    const redirectPath = getDashboardRedirectPath("ADMIN", null);
    assert.equal(redirectPath, "/login");
  });

  test("redirects wrong-role users to their own dashboard", () => {
    const redirectPath = getDashboardRedirectPath("ADMIN", parentUser);
    assert.equal(redirectPath, "/parent");
  });

  test("allows matching role users", () => {
    const redirectPath = getDashboardRedirectPath("ADMIN", adminUser);
    assert.equal(redirectPath, null);
  });
});
