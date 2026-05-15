import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";

describe("auth validation schemas", () => {
  test("registerSchema rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Parent Name",
      email: "parent@example.com",
      password: "password123",
      confirmPassword: "password124"
    });

    assert.equal(result.success, false);
  });

  test("loginSchema rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123"
    });

    assert.equal(result.success, false);
  });
});
