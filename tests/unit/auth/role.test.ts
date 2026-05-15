import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getDashboardPathForRole } from "@/lib/auth/role";

describe("getDashboardPathForRole", () => {
  test("returns /admin for ADMIN", () => {
    assert.equal(getDashboardPathForRole("ADMIN"), "/admin");
  });

  test("returns /tutor for TUTOR", () => {
    assert.equal(getDashboardPathForRole("TUTOR"), "/tutor");
  });

  test("returns /parent for PARENT", () => {
    assert.equal(getDashboardPathForRole("PARENT"), "/parent");
  });

  test("returns /login for unknown role", () => {
    assert.equal(getDashboardPathForRole("UNKNOWN"), "/login");
    assert.equal(getDashboardPathForRole(null), "/login");
  });
});
