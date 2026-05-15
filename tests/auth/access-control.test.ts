import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  canAccessAssessmentWithClient,
  canAccessStudentWithClient
} from "@/lib/auth/access-control-core";

function createStudentAccessClient({
  studentFound,
  tutorLessonFound
}: {
  studentFound: boolean;
  tutorLessonFound?: boolean;
}): Parameters<typeof canAccessStudentWithClient>[0] {
  return {
    studentProfile: {
      findFirst: async () => (studentFound ? { id: "student-id" } : null)
    },
    lesson: {
      findFirst: async () => (tutorLessonFound ? { id: "lesson-id" } : null)
    }
  };
}

function createAssessmentAccessClient({
  assessmentFound
}: {
  assessmentFound: boolean;
}): Parameters<typeof canAccessAssessmentWithClient>[0] {
  return {
    assessmentRequest: {
      findFirst: async () =>
        assessmentFound ? { id: "assessment-id" } : null
    }
  };
}

describe("canAccessStudent", () => {
  test("allows owning parent access", async () => {
    const access = await canAccessStudentWithClient(
      createStudentAccessClient({ studentFound: true }),
      "parent-user-id",
      "PARENT",
      "student-id"
    );

    assert.equal(access, true);
  });

  test("blocks unrelated parent access", async () => {
    const access = await canAccessStudentWithClient(
      createStudentAccessClient({ studentFound: false }),
      "another-parent-user-id",
      "PARENT",
      "student-id"
    );

    assert.equal(access, false);
  });

  test("allows admin access", async () => {
    const access = await canAccessStudentWithClient(
      createStudentAccessClient({ studentFound: false }),
      "admin-user-id",
      "ADMIN",
      "student-id"
    );

    assert.equal(access, true);
  });
});

describe("canAccessAssessment", () => {
  test("allows parent access to own assessment", async () => {
    const access = await canAccessAssessmentWithClient(
      createAssessmentAccessClient({ assessmentFound: true }),
      "parent-user-id",
      "PARENT",
      "assessment-id"
    );

    assert.equal(access, true);
  });

  test("blocks parent access to another parent's assessment", async () => {
    const access = await canAccessAssessmentWithClient(
      createAssessmentAccessClient({ assessmentFound: false }),
      "other-parent-user-id",
      "PARENT",
      "assessment-id"
    );

    assert.equal(access, false);
  });

  test("allows admin access to any assessment", async () => {
    const access = await canAccessAssessmentWithClient(
      createAssessmentAccessClient({ assessmentFound: false }),
      "admin-user-id",
      "ADMIN",
      "assessment-id"
    );

    assert.equal(access, true);
  });

  test("blocks tutor assessment access in Phase 6A", async () => {
    const access = await canAccessAssessmentWithClient(
      createAssessmentAccessClient({ assessmentFound: true }),
      "tutor-user-id",
      "TUTOR",
      "assessment-id"
    );

    assert.equal(access, false);
  });
});
