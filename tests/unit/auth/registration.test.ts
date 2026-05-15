import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { buildParentRegistrationData } from "@/server/services/auth-registration";

describe("buildParentRegistrationData", () => {
  test("always creates parent role data", () => {
    const data = buildParentRegistrationData({
      fullName: "  Parent Name  ",
      email: "PARENT@EXAMPLE.COM ",
      passwordHash: "hashed-value"
    });

    assert.equal(data.role, "PARENT");
    assert.equal(data.name, "Parent Name");
    assert.equal(data.email, "parent@example.com");
    assert.equal(data.passwordHash, "hashed-value");
  });
});
