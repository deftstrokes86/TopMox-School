import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { canAccessStudentWithClient } from "@/lib/auth/access-control-core";

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
