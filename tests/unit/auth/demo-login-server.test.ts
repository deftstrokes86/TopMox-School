import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { authorizeDemoLogin } from "@/lib/auth/demo-login.server";

type DemoRole = "ADMIN" | "PARENT" | "TUTOR";

function withDemoEnv<T>(enabled: boolean, callback: () => Promise<T>): Promise<T> {
  const previousValue = process.env.DEMO_LOGIN_ENABLED;
  process.env.DEMO_LOGIN_ENABLED = enabled ? "true" : "false";

  return callback().finally(() => {
    if (previousValue === undefined) {
      delete process.env.DEMO_LOGIN_ENABLED;
    } else {
      process.env.DEMO_LOGIN_ENABLED = previousValue;
    }
  });
}

function createRepository(role: DemoRole, overrides: Record<string, unknown> = {}) {
  const emails: Record<DemoRole, string> = {
    ADMIN: "admin@topmox.test",
    PARENT: "ngozi.parent@topmox.test",
    TUTOR: "amara.math@topmox.test"
  };

  return {
    user: {
      async findUnique(args: {
        where: { email: string };
        select: Record<string, unknown>;
      }) {
        assert.equal(args.where.email, emails[role]);
        assert.equal(args.select.passwordHash, true);

        return {
          id: `${role.toLowerCase()}-id`,
          email: emails[role],
          name: `Demo ${role}`,
          role,
          passwordHash: "scrypt$demo-salt$demo-hash",
          parentProfile:
            role === "PARENT"
              ? { id: "parent-profile-id", students: [{ id: "student-id" }] }
              : null,
          tutorProfile: role === "TUTOR" ? { id: "tutor-profile-id" } : null,
          ...overrides
        };
      }
    }
  };
}

describe("server-enforced demo login", () => {
  test("rejects demo login when DEMO_LOGIN_ENABLED is false", async () => {
    await withDemoEnv(false, async () => {
      const result = await authorizeDemoLogin("ADMIN", createRepository("ADMIN"));
      assert.equal(result, null);
    });
  });

  test("rejects invalid demo roles before querying users", async () => {
    await withDemoEnv(true, async () => {
      let queryCount = 0;
      const repository = {
        user: {
          async findUnique() {
            queryCount += 1;
            return null;
          }
        }
      };

      const result = await authorizeDemoLogin("OWNER", repository);
      assert.equal(result, null);
      assert.equal(queryCount, 0);
    });
  });

  test("authorizes seeded admin without returning passwordHash", async () => {
    await withDemoEnv(true, async () => {
      const result = await authorizeDemoLogin("ADMIN", createRepository("ADMIN"));

      assert.deepEqual(result, {
        id: "admin-id",
        email: "admin@topmox.test",
        name: "Demo ADMIN",
        role: "ADMIN"
      });
      assert.equal(Object.hasOwn(result ?? {}, "passwordHash"), false);
    });
  });

  test("requires parent demo account to have a ParentProfile and StudentProfile", async () => {
    await withDemoEnv(true, async () => {
      assert.equal(
        await authorizeDemoLogin(
          "PARENT",
          createRepository("PARENT", { parentProfile: null })
        ),
        null
      );
      assert.equal(
        await authorizeDemoLogin(
          "PARENT",
          createRepository("PARENT", {
            parentProfile: { id: "parent-profile-id", students: [] }
          })
        ),
        null
      );
      assert.equal(
        (await authorizeDemoLogin("PARENT", createRepository("PARENT")))?.role,
        "PARENT"
      );
    });
  });

  test("requires tutor demo account to have a TutorProfile", async () => {
    await withDemoEnv(true, async () => {
      assert.equal(
        await authorizeDemoLogin(
          "TUTOR",
          createRepository("TUTOR", { tutorProfile: null })
        ),
        null
      );
      assert.equal(
        (await authorizeDemoLogin("TUTOR", createRepository("TUTOR")))?.role,
        "TUTOR"
      );
    });
  });

  test("rejects demo accounts with missing or legacy plaintext password hashes", async () => {
    await withDemoEnv(true, async () => {
      assert.equal(
        await authorizeDemoLogin(
          "ADMIN",
          createRepository("ADMIN", { passwordHash: null })
        ),
        null
      );
      assert.equal(
        await authorizeDemoLogin(
          "ADMIN",
          createRepository("ADMIN", { passwordHash: "demo-only-change-me" })
        ),
        null
      );
    });
  });
});
