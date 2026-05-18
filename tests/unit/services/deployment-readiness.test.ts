import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

const repoRoot = process.cwd();

function readProjectFile(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

function assertIncludesAll(
  content: string,
  expectedValues: string[],
  context: string
) {
  for (const value of expectedValues) {
    assert.match(
      content,
      new RegExp(escapeRegExp(value), "i"),
      `${context}: ${value}`
    );
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("deployment readiness", () => {
  test(".env.example uses production-safe placeholders and defaults", () => {
    const envExample = readProjectFile(".env.example");
    const expectedLines = [
      'DATABASE_URL=""',
      'AUTH_SECRET=""',
      'NEXTAUTH_SECRET=""',
      'NEXTAUTH_URL=""',
      'APP_BASE_URL=""',
      'FLUTTERWAVE_PUBLIC_KEY=""',
      'FLUTTERWAVE_SECRET_KEY=""',
      'FLUTTERWAVE_SECRET_HASH=""',
      'FLUTTERWAVE_BASE_URL="https://api.flutterwave.com/v3"',
      'NEXT_PUBLIC_FLUTTERWAVE_ENABLED="true"',
      'NEXT_PUBLIC_MANUAL_PAYMENTS_ENABLED="true"',
      'NEXT_PUBLIC_DEMO_LOGIN_ENABLED="false"'
    ];

    for (const line of expectedLines) {
      assert.match(
        envExample,
        new RegExp(`^${escapeRegExp(line)}$`, "m"),
        `.env.example should include ${line}`
      );
    }

    assert.doesNotMatch(envExample, /demo-only-change-me/);
    assert.doesNotMatch(envExample, /FLWSECK|sk_live|pk_live/);
  });

  test(".env.example is not hidden by repository ignore rules", () => {
    const gitignore = readProjectFile(".gitignore");

    assert.match(
      gitignore,
      /^!\.env\.example$/m,
      ".env.example should be explicitly unignored so deployment placeholders are committed"
    );
  });

  test("deployment guide documents staging, verification, and payment safety", () => {
    const path = "docs/deployment.md";

    assert.equal(existsSync(join(repoRoot, path)), true, `${path} should exist`);

    const document = readProjectFile(path);

    assertIncludesAll(
      document,
      [
        "Prerequisites",
        "Local setup",
        "Verification",
        "Production/staging deployment",
        "Flutterwave notes",
        "Troubleshooting",
        "npm run test",
        "npm run lint",
        "npm run typecheck",
        "npm run build",
        "npm run verify:site",
        "npm run verify:browser",
        "npx prisma migrate deploy",
        "npm run prisma:seed",
        "/api/webhooks/flutterwave",
        "/api/payments/flutterwave/callback",
        "verify amount",
        "currency",
        "reference",
        "Hostinger",
        "Do not use static export",
        "CF-IPCountry",
        "topmox_region",
        "country selector"
      ],
      "deployment guide"
    );

    assert.doesNotMatch(document, /x-vercel-ip-country/i);
    assert.doesNotMatch(document, /x-vercel-ip-continent/i);
    assert.doesNotMatch(document, /x-vercel-ip-timezone/i);
  });

  test("package scripts support release verification and Prisma operations", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts: Record<string, string>;
    };

    const requiredScripts = [
      "dev",
      "build",
      "start",
      "lint",
      "typecheck",
      "test",
      "test:watch",
      "verify:site",
      "verify:browser",
      "prisma:generate",
      "prisma:migrate",
      "prisma:seed",
      "prisma:studio",
      "clean:next",
      "dev:clean"
    ];

    for (const script of requiredScripts) {
      assert.equal(
        typeof packageJson.scripts[script],
        "string",
        `package.json should define ${script}`
      );
    }
  });

  test("public SEO entry points expose metadata without overpromising", () => {
    const metadataFiles = [
      "src/app/(public)/page.tsx",
      "src/app/(public)/global-tutoring/page.tsx",
      "src/app/(public)/subjects/page.tsx",
      "src/app/(public)/exam-prep/page.tsx",
      "src/app/(public)/pricing/page.tsx",
      "src/app/(public)/about/page.tsx",
      "src/app/(public)/faq/page.tsx",
      "src/app/(public)/contact/page.tsx",
      "src/app/(public)/resources/page.tsx",
      "src/app/(public)/resources/[slug]/page.tsx"
    ];

    for (const file of metadataFiles) {
      const source = readProjectFile(file);

      assert.match(
        source,
        /export (const metadata|async function generateMetadata)/,
        `${file} should export metadata`
      );
      assert.doesNotMatch(source, /guaranteed (grades?|results?|success)/i);
      assert.doesNotMatch(source, /keyword stuffing/i);
    }
  });
});
