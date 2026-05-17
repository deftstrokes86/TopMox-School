import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

const repoRoot = process.cwd();

function readProjectFile(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("app stability infrastructure", () => {
  test("site smoke script covers public, auth, dashboard, and health routes", () => {
    const verifySiteScript = readProjectFile("scripts/verify-site.mjs");
    const requiredRoutes = [
      "/",
      "/global-tutoring",
      "/subjects",
      "/pricing",
      "/about",
      "/faq",
      "/contact",
      "/resources",
      "/resources/how-online-tutoring-works-at-topmox",
      "/login",
      "/register",
      "/forgot-password",
      "/admin",
      "/parent",
      "/tutor",
      "/api/health"
    ];

    for (const route of requiredRoutes) {
      assert.match(
        verifySiteScript,
        new RegExp(`["']${route.replace("/", "\\/")}["']`),
        `Expected scripts/verify-site.mjs to smoke check ${route}`
      );
    }
  });

  test("browser smoke checks include the published resource detail route", () => {
    const browserSmokeSpec = readProjectFile("tests/e2e/smoke.spec.ts");

    assert.match(
      browserSmokeSpec,
      /["']\/resources\/how-online-tutoring-works-at-topmox["']/,
      "Expected Playwright smoke checks to cover a published resource detail page"
    );
  });

  test("Next.js app has root error, global error, not-found, and loading boundaries", () => {
    const requiredBoundaryFiles = [
      "src/app/error.tsx",
      "src/app/global-error.tsx",
      "src/app/not-found.tsx",
      "src/app/loading.tsx"
    ];

    for (const path of requiredBoundaryFiles) {
      assert.equal(existsSync(join(repoRoot, path)), true, `${path} should exist`);
    }
  });

  test("dashboard route groups have local error and loading fallbacks", () => {
    const requiredRouteGroupFiles = [
      "src/app/admin/error.tsx",
      "src/app/admin/loading.tsx",
      "src/app/parent/error.tsx",
      "src/app/parent/loading.tsx",
      "src/app/tutor/error.tsx",
      "src/app/tutor/loading.tsx",
      "src/app/(public)/error.tsx",
      "src/app/(public)/loading.tsx",
      "src/app/(auth)/error.tsx",
      "src/app/(auth)/loading.tsx"
    ];

    for (const path of requiredRouteGroupFiles) {
      assert.equal(existsSync(join(repoRoot, path)), true, `${path} should exist`);
    }
  });
});
