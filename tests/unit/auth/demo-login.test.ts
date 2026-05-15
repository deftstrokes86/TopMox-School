import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  DEMO_LOGIN_ACCOUNTS,
  isDemoLoginEnabled,
  parseDemoLoginEnabled
} from "@/lib/auth/demo-login";

describe("demo login helpers", () => {
  test("parseDemoLoginEnabled respects env-style flag values", () => {
    assert.equal(parseDemoLoginEnabled("true"), true);
    assert.equal(parseDemoLoginEnabled("false"), false);
    assert.equal(parseDemoLoginEnabled(undefined), false);
  });

  test("isDemoLoginEnabled reads NEXT_PUBLIC_DEMO_LOGIN_ENABLED", () => {
    const previousValue = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;

    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "true";
    assert.equal(isDemoLoginEnabled(), true);

    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "false";
    assert.equal(isDemoLoginEnabled(), false);

    if (previousValue === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousValue;
    }
  });

  test("demo accounts include admin, tutor, and parent", () => {
    const roles = DEMO_LOGIN_ACCOUNTS.map((account) => account.role).sort();
    assert.deepEqual(roles, ["ADMIN", "PARENT", "TUTOR"]);
  });
});
