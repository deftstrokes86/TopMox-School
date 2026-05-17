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

  test("demo login cannot be enabled in production", () => {
    const previousValue = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    const previousNodeEnv = process.env.NODE_ENV;
    const mutableEnv = process.env as Record<string, string | undefined>;

    try {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "true";
      mutableEnv.NODE_ENV = "production";

      assert.equal(isDemoLoginEnabled(), false);
    } finally {
      if (previousValue === undefined) {
        delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
      } else {
        process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousValue;
      }

      if (previousNodeEnv === undefined) {
        delete mutableEnv.NODE_ENV;
      } else {
        mutableEnv.NODE_ENV = previousNodeEnv;
      }
    }
  });

  test("demo accounts include admin, tutor, and parent", () => {
    const roles = [...new Set(DEMO_LOGIN_ACCOUNTS.map((account) => account.role))].sort();
    assert.deepEqual(roles, ["ADMIN", "PARENT", "TUTOR"]);
    assert.equal(
      DEMO_LOGIN_ACCOUNTS.every((account) => account.name && account.walkthrough),
      true
    );
  });
});
