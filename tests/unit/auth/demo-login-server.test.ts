import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  authorizeDemoLogin,
  getDemoLoginReadiness,
  type DemoLoginRepository
} from "@/lib/auth/demo-login.server";

type DemoRole = "ADMIN" | "PARENT" | "TUTOR";
type DemoLoginUserRecord = NonNullable<
  Awaited<ReturnType<DemoLoginRepository["user"]["findUnique"]>>
>;

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

function createRepository(
  overrideRole?: DemoRole,
  overrides: Partial<DemoLoginUserRecord> = {}
): DemoLoginRepository {
  const emails: Record<DemoRole, string> = {
    ADMIN: "admin@topmox.test",
    PARENT: "parent@topmox.test",
    TUTOR: "tutor@topmox.test"
  };

  const records: Record<DemoRole, DemoLoginUserRecord> = {
    ADMIN: {
      id: "admin-id",
      email: emails.ADMIN,
      name: "Demo ADMIN",
      role: "ADMIN",
      passwordHash: "scrypt$demo-salt$demo-hash",
      parentProfile: null,
      tutorProfile: null
    },
    PARENT: {
      id: "parent-id",
      email: emails.PARENT,
      name: "Demo PARENT",
      role: "PARENT",
      passwordHash: "scrypt$demo-salt$demo-hash",
      parentProfile: { id: "parent-profile-id", students: [{ id: "student-id" }] },
      tutorProfile: null
    },
    TUTOR: {
      id: "tutor-id",
      email: emails.TUTOR,
      name: "Demo TUTOR",
      role: "TUTOR",
      passwordHash: "scrypt$demo-salt$demo-hash",
      parentProfile: null,
      tutorProfile: { id: "tutor-profile-id" }
    }
  };

  return {
    user: {
      async findUnique(args: {
        where: { email: string };
        select: Record<string, unknown>;
      }) {
        assert.equal(args.select.passwordHash, true);
        const role = (Object.keys(emails) as DemoRole[]).find(
          (candidateRole) => emails[candidateRole] === args.where.email
        );

        assert.ok(role, `unexpected demo email query: ${args.where.email}`);

        return {
          ...records[role],
          ...(overrideRole === role ? overrides : {})
        };
      }
    }
  };
}

describe("server-enforced demo login", () => {
  test("reports unavailable when public demo visibility is disabled", async () => {
    const previousPublic = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;

    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "false";

    await withDemoEnv(true, async () => {
      const readiness = await getDemoLoginReadiness(createRepository("ADMIN"));
      assert.equal(readiness.available, false);
      assert.equal(readiness.reason, "public-disabled");
      assert.equal(readiness.message, "Demo login is disabled in this environment.");
    });

    if (previousPublic === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousPublic;
    }
  });

  test("reports unavailable when server demo flag is disabled", async () => {
    const previousPublic = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "true";

    await withDemoEnv(false, async () => {
      const readiness = await getDemoLoginReadiness(createRepository("ADMIN"));
      assert.equal(readiness.available, false);
      assert.equal(readiness.reason, "server-disabled");
      assert.equal(readiness.message, "Demo login is disabled in this environment.");
    });

    if (previousPublic === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousPublic;
    }
  });

  test("reports database unavailable instead of generic config failure", async () => {
    const previousPublic = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "true";

    await withDemoEnv(true, async () => {
      const repository = {
        user: {
          async findUnique() {
            throw new Error("P1001 simulated database outage");
          }
        }
      };

      const readiness = await getDemoLoginReadiness(repository);
      assert.equal(readiness.available, false);
      assert.equal(readiness.reason, "database-unavailable");
      assert.equal(readiness.message, "Database unavailable. Check /api/health.");
    });

    if (previousPublic === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousPublic;
    }
  });

  test("reports available only when all fixed demo accounts are ready", async () => {
    const previousPublic = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = "true";

    await withDemoEnv(true, async () => {
      const readiness = await getDemoLoginReadiness(createRepository("ADMIN"));
      assert.equal(readiness.available, true);
      assert.equal(readiness.reason, "ready");
    });

    if (previousPublic === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED = previousPublic;
    }
  });

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
