import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  DEMO_LOGIN_ACCOUNTS,
  DEMO_LOGIN_PASSWORD
} from "@/lib/auth/demo-login";

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

describe("demo walkthrough readiness", () => {
  test("demo login quick access covers admin, two tutors, and three parent locations", () => {
    const expectedAccounts = [
      { email: "admin@topmox.test", role: "ADMIN" },
      { email: "amara.math@topmox.test", role: "TUTOR" },
      { email: "david.english@topmox.test", role: "TUTOR" },
      { email: "ngozi.parent@topmox.test", role: "PARENT" },
      { email: "bola.ukparent@topmox.test", role: "PARENT" },
      { email: "ada.canadaparent@topmox.test", role: "PARENT" }
    ] as const;

    const accountsByEmail = new Map(
      DEMO_LOGIN_ACCOUNTS.map((account) => [account.email, account])
    );

    assert.equal(
      DEMO_LOGIN_PASSWORD,
      "demo-only-change-me",
      "demo password should be visibly demo-only"
    );

    for (const expectedAccount of expectedAccounts) {
      assert.equal(
        accountsByEmail.get(expectedAccount.email)?.role,
        expectedAccount.role,
        `${expectedAccount.email} should be available for demo quick login`
      );
    }
  });

  test("seed script includes the required demo accounts and geography story", () => {
    const seed = readProjectFile("prisma/seed.ts");

    assertIncludesAll(
      seed,
      [
        "admin@topmox.test",
        "amara.math@topmox.test",
        "david.english@topmox.test",
        "ngozi.parent@topmox.test",
        "bola.ukparent@topmox.test",
        "ada.canadaparent@topmox.test",
        "Nigeria",
        "United Kingdom",
        "Canada",
        "Mathematics",
        "Science",
        "English",
        "Reading & Comprehension"
      ],
      "seed demo account and geography coverage"
    );
  });

  test("seed script supports the full client demo story", () => {
    const seed = readProjectFile("prisma/seed.ts");

    assertIncludesAll(
      seed,
      [
        "studentProfile.create",
        "assessmentRequest.create",
        "AssessmentStatus.PENDING_REVIEW",
        "AssessmentStatus.SCHEDULED",
        "AssessmentStatus.COMPLETED",
        "AssessmentStatus.PLAN_RECOMMENDED",
        "AssessmentStatus.CONVERTED",
        "assessmentOutcome.create",
        "enrollment.create",
        "EnrollmentStatus.PENDING_PAYMENT",
        "EnrollmentStatus.ACTIVE",
        "payment.create",
        "PaymentStatus.AWAITING_VERIFICATION",
        "PaymentStatus.PAID",
        "lesson.create",
        "LessonStatus.SCHEDULED",
        "LessonStatus.COMPLETED",
        "lessonNotes",
        "homework.create",
        "progressReport.create",
        "ReportStatus.DRAFT",
        "ReportStatus.REVIEW",
        "ReportStatus.PUBLISHED",
        "supportRequest.create",
        "notification.createMany",
        "communicationLog.createMany"
      ],
      "seed demo story coverage"
    );
  });

  test("seed script avoids demo-quality pitfalls", () => {
    const seed = readProjectFile("prisma/seed.ts");
    const forbiddenPatterns = [
      /lorem ipsum/i,
      /fake bank/i,
      /bank account/i,
      /account number/i,
      /guaranteed (grades?|results?|success)/i,
      /real personal data/i
    ];

    for (const pattern of forbiddenPatterns) {
      assert.doesNotMatch(seed, pattern);
    }

    assert.match(
      seed,
      /const paymentPaid[\s\S]+enrollmentId: enrollmentActive\.id[\s\S]+status: PaymentStatus\.PAID/,
      "paid demo payment should be attached to the active enrollment story"
    );
    assert.match(
      seed,
      /const paymentAwaiting[\s\S]+enrollmentId: enrollmentPendingPayment\.id[\s\S]+status: PaymentStatus\.AWAITING_VERIFICATION/,
      "awaiting payment should be attached to the pending-payment enrollment story"
    );
  });

  test("demo walkthrough document is ready for client presentation", () => {
    const path = "docs/demo-walkthrough.md";

    assert.equal(existsSync(join(repoRoot, path)), true, `${path} should exist`);

    const document = readProjectFile(path);
    assertIncludesAll(
      document,
      [
        "TopMox already has the school. This platform turns that school credibility into an international tutoring business.",
        "Homepage",
        "Global tutoring page",
        "Book assessment flow",
        "Parent dashboard",
        "Admin assessment management",
        "Tutor lesson delivery/homework",
        "Progress report",
        "Notifications/activity",
        "admin@topmox.test",
        "amara.math@topmox.test",
        "ngozi.parent@topmox.test",
        "npm run prisma:seed",
        "npm run dev:clean",
        "npm run verify:browser"
      ],
      "demo walkthrough document"
    );
  });

  test("client handoff notes document MVP readiness and dependencies", () => {
    const path = "docs/client-handoff-notes.md";

    assert.equal(existsSync(join(repoRoot, path)), true, `${path} should exist`);

    const document = readProjectFile(path);
    assertIncludesAll(
      document,
      [
        "What has been built",
        "MVP-ready",
        "real TopMox content",
        "Flutterwave account setup",
        "real tutor list",
        "real pricing",
        "school branding assets",
        "launch first",
        "Recommended paid next steps"
      ],
      "client handoff notes"
    );
  });
});
