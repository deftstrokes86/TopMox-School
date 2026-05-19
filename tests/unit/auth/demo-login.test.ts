import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  DEMO_LOGIN_ACCOUNTS,
  getDemoLoginAccountForRole,
  isDemoLoginVisible,
  parseDemoLoginEnabled
} from "@/lib/auth/demo-login";
import { isDemoLoginServerEnabled } from "@/lib/auth/demo-login.server";

describe("demo login helpers", () => {
  test("parseDemoLoginEnabled respects env-style flag values", () => {
    assert.equal(parseDemoLoginEnabled("true"), true);
    assert.equal(parseDemoLoginEnabled("false"), false);
    assert.equal(parseDemoLoginEnabled(undefined), false);
  });

  test("isDemoLoginVisible reads only NEXT_PUBLIC_DEMO_LOGIN_ENABLED", () => {
    const previousValue = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;

    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "true";
    assert.equal(isDemoLoginVisible(), true);

    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "false";
    assert.equal(isDemoLoginVisible(), false);

    if (previousValue === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousValue;
    }
  });

  test("server demo authorization reads only DEMO_LOGIN_ENABLED", () => {
    const previousPublicValue = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    const previousServerValue = process.env.DEMO_LOGIN_ENABLED;

    try {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "true";
      process.env.DEMO_LOGIN_ENABLED = "false";
      assert.equal(isDemoLoginVisible(), true);
      assert.equal(isDemoLoginServerEnabled(), false);

      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "false";
      process.env.DEMO_LOGIN_ENABLED = "true";
      assert.equal(isDemoLoginVisible(), false);
      assert.equal(isDemoLoginServerEnabled(), true);
    } finally {
      if (previousPublicValue === undefined) {
        delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
      } else {
        process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousPublicValue;
      }

      if (previousServerValue === undefined) {
        delete process.env.DEMO_LOGIN_ENABLED;
      } else {
        process.env.DEMO_LOGIN_ENABLED = previousServerValue;
      }
    }
  });

  test("demo accounts include one fixed quick-login account per role", () => {
    const roles = [...new Set(DEMO_LOGIN_ACCOUNTS.map((account) => account.role))].sort();
    assert.deepEqual(roles, ["ADMIN", "PARENT", "TUTOR"]);
    assert.equal(DEMO_LOGIN_ACCOUNTS.length, 3);
    assert.equal(
      DEMO_LOGIN_ACCOUNTS.every((account) => account.name && account.walkthrough),
      true
    );
  });

  test("demo account mapping never accepts arbitrary roles or emails", () => {
    assert.equal(getDemoLoginAccountForRole("ADMIN")?.email, "admin@topmox.test");
    assert.equal(getDemoLoginAccountForRole("PARENT")?.email, "parent@topmox.test");
    assert.equal(getDemoLoginAccountForRole("TUTOR")?.email, "tutor@topmox.test");
    assert.equal(getDemoLoginAccountForRole("OWNER"), null);
    assert.equal(getDemoLoginAccountForRole("admin@topmox.test"), null);
  });
});
