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

describe("Phase 15C demo data readiness", () => {
  test("seed covers the required demo accounts, plans, statuses, and resources", () => {
    const seed = [
      readProjectFile("prisma/seed.ts"),
      readProjectFile("src/lib/resources/default-resources.ts")
    ].join("\n");

    assertIncludesAll(
      seed,
      [
        "admin@topmox.test",
        "amara.math@topmox.test",
        "david.english@topmox.test",
        "ngozi.parent@topmox.test",
        "bola.ukparent@topmox.test",
        "ada.canadaparent@topmox.test",
        "Starter Support",
        "Growth Plan",
        "Exam Prep Intensive",
        "Homework Club",
        "AssessmentStatus.PENDING_REVIEW",
        "AssessmentStatus.SCHEDULED",
        "AssessmentStatus.COMPLETED",
        "AssessmentStatus.PLAN_RECOMMENDED",
        "AssessmentStatus.CONVERTED",
        "EnrollmentStatus.PENDING_PAYMENT",
        "EnrollmentStatus.ACTIVE",
        "PaymentStatus.AWAITING_VERIFICATION",
        "PaymentStatus.PAID",
        "LessonStatus.SCHEDULED",
        "LessonStatus.COMPLETED",
        "ReportStatus.DRAFT",
        "ReportStatus.REVIEW",
        "ReportStatus.PUBLISHED",
        "SupportStatus.OPEN",
        "SupportStatus.IN_REVIEW",
        "communicationLog.createMany",
        "How online tutoring works at TopMox",
        "How to help your child improve in Mathematics",
        "Reading habits for primary school children",
        "Preparing your child for exam success",
        "ResourceStatus.DRAFT",
        "ResourceStatus.ARCHIVED"
      ],
      "seed demo inventory"
    );
  });

  test("seed command loads Next environment files such as .env.local", () => {
    const seed = readProjectFile("prisma/seed.ts");

    assert.match(seed, /loadEnvConfig\(process\.cwd\(\)\)/);
  });

  test("seed does not schedule or complete lessons against pending-payment enrollments", () => {
    const seed = readProjectFile("prisma/seed.ts");

    assert.doesNotMatch(
      seed,
      /enrollmentId:\s*enrollmentPendingPayment\.id[\s\S]{0,500}?status:\s*LessonStatus\.(SCHEDULED|COMPLETED)/,
      "pending-payment enrollments should not have scheduled or completed demo lessons"
    );
  });

  test("seed does not leave future scheduled lessons on paused enrollments", () => {
    const seed = readProjectFile("prisma/seed.ts");

    assert.doesNotMatch(
      seed,
      /enrollmentId:\s*enrollmentPaused\.id[\s\S]{0,500}?status:\s*LessonStatus\.SCHEDULED/,
      "paused enrollments can show history, but should not have upcoming scheduled demo lessons"
    );
  });

  test("active demo enrollments have a believable paid payment path", () => {
    const seed = readProjectFile("prisma/seed.ts");

    assert.match(
      seed,
      /const paymentPaid[\s\S]+enrollmentId:\s*enrollmentActive\.id[\s\S]+status:\s*PaymentStatus\.PAID/,
      "Nigeria active enrollment should have a paid payment path"
    );
    assert.match(
      seed,
      /const paymentPaidUk[\s\S]+enrollmentId:\s*enrollmentEnglishActive\.id[\s\S]+status:\s*PaymentStatus\.PAID/,
      "UK active English enrollment should have a paid payment path"
    );
  });

  test("demo walkthrough follows the requested client presentation sequence", () => {
    const path = "docs/demo-walkthrough.md";
    assert.equal(existsSync(join(repoRoot, path)), true, `${path} should exist`);

    const document = readProjectFile(path);
    assertIncludesAll(
      document,
      [
        "TopMox already has the school. This platform turns that school credibility into an international tutoring business.",
        "Demo objective",
        "1. Homepage.",
        "2. Global tutoring page.",
        "3. Pricing page.",
        "4. Parent login.",
        "5. Parent dashboard.",
        "6. Child profile.",
        "7. Assessment request.",
        "8. Assessment recommendation.",
        "9. Plan acceptance/enrollment.",
        "10. Payment status.",
        "11. Admin login.",
        "12. Admin dashboard.",
        "13. Admin assessment management.",
        "14. Admin payment review.",
        "15. Admin tutor assignment and lesson scheduling.",
        "16. Tutor login.",
        "17. Tutor lesson view.",
        "18. Tutor lesson completion/homework.",
        "19. Parent lesson notes/homework.",
        "20. Progress report.",
        "21. Support request.",
        "22. Notifications/activity.",
        "23. Resources.",
        "24. Final admin dashboard view.",
        "What to show",
        "What to say",
        "Why it matters to TopMox",
        "What business value it proves",
        "RUN_AUTH_E2E",
        "P1001",
        "/api/health"
      ],
      "demo walkthrough client sequence"
    );
  });

  test("client handoff notes cover MVP readiness, configuration, next steps, and risks", () => {
    const path = "docs/client-handoff-notes.md";
    assert.equal(existsSync(join(repoRoot, path)), true, `${path} should exist`);

    const document = readProjectFile(path);
    assertIncludesAll(
      document,
      [
        "What has been built",
        "What is MVP-ready",
        "What TopMox needs to provide",
        "What requires configuration",
        "Recommended paid next steps",
        "Risks and assumptions",
        "Flutterwave available methods vary by country/currency/account setup",
        "Supabase pooler/network reliability should be monitored",
        "Demo data is not production data",
        "No guaranteed grade promises"
      ],
      "client handoff sections"
    );
  });
});
