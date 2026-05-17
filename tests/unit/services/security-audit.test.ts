import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("security audit guardrails", () => {
  test(".env.example documents required deployment and payment safety variables", () => {
    const envExample = readRepoFile(".env.example");
    const requiredVariables = [
      "DATABASE_URL",
      "AUTH_SECRET",
      "NEXTAUTH_URL",
      "APP_BASE_URL",
      "FLUTTERWAVE_PUBLIC_KEY",
      "FLUTTERWAVE_SECRET_KEY",
      "FLUTTERWAVE_SECRET_HASH",
      "FLUTTERWAVE_BASE_URL",
      "NEXT_PUBLIC_FLUTTERWAVE_ENABLED",
      "NEXT_PUBLIC_MANUAL_PAYMENTS_ENABLED",
      "NEXT_PUBLIC_DEMO_LOGIN_ENABLED"
    ];

    for (const variable of requiredVariables) {
      assert.match(envExample, new RegExp(`^${variable}=`, "m"));
    }
  });

  test("client components do not import Prisma, query services, or server secrets", () => {
    const candidateFiles = [
      "src/components/forms/parent/payment-submission-form.tsx",
      "src/components/forms/auth/login-form.tsx",
      "src/components/dashboard/NotificationDropdown.tsx",
      "src/app/ClientLayout.tsx"
    ];

    for (const file of candidateFiles) {
      const source = readRepoFile(file);

      assert.doesNotMatch(source, /@\/lib\/db/);
      assert.doesNotMatch(source, /@\/server\/queries/);
      assert.doesNotMatch(source, /@\/server\/services/);
      assert.doesNotMatch(source, /PrismaClient/);
      assert.doesNotMatch(
        source,
        /process\.env\.(FLUTTERWAVE_SECRET|AUTH_SECRET|NEXTAUTH_SECRET|DATABASE_URL)/
      );
    }
  });

  test("protected dashboard middleware covers each role route group", () => {
    const middleware = readRepoFile("src/middleware.ts");

    assert.match(middleware, /prefix:\s*"\/admin",\s*role:\s*"ADMIN"/);
    assert.match(middleware, /prefix:\s*"\/parent",\s*role:\s*"PARENT"/);
    assert.match(middleware, /prefix:\s*"\/tutor",\s*role:\s*"TUTOR"/);
    assert.match(middleware, /callbackUrl/);
  });
});
