import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  canAccessAssessmentWithClient,
  canAccessEnrollmentWithClient,
  canAccessLessonWithClient,
  canAccessPaymentWithClient,
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

function createEnrollmentAccessClient({
  enrollmentFound
}: {
  enrollmentFound: boolean;
}): Parameters<typeof canAccessEnrollmentWithClient>[0] {
  return {
    enrollment: {
      findFirst: async () => (enrollmentFound ? { id: "enrollment-id" } : null)
    }
  };
}

function createPaymentAccessClient({
  paymentFound
}: {
  paymentFound: boolean;
}): Parameters<typeof canAccessPaymentWithClient>[0] {
  return {
    payment: {
      findFirst: async () => (paymentFound ? { id: "payment-id" } : null)
    }
  };
}

function createLessonAccessClient({
  lessonFound
}: {
  lessonFound: boolean;
}): Parameters<typeof canAccessLessonWithClient>[0] {
  return {
    lesson: {
      findFirst: async () => (lessonFound ? { id: "lesson-id" } : null)
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

describe("canAccessEnrollment", () => {
  test("allows parent access to own enrollment", async () => {
    const access = await canAccessEnrollmentWithClient(
      createEnrollmentAccessClient({ enrollmentFound: true }),
      "parent-user-id",
      "PARENT",
      "enrollment-id"
    );

    assert.equal(access, true);
  });

  test("blocks parent access to another parent's enrollment", async () => {
    const access = await canAccessEnrollmentWithClient(
      createEnrollmentAccessClient({ enrollmentFound: false }),
      "other-parent-user-id",
      "PARENT",
      "enrollment-id"
    );

    assert.equal(access, false);
  });

  test("allows admin access to any enrollment", async () => {
    const access = await canAccessEnrollmentWithClient(
      createEnrollmentAccessClient({ enrollmentFound: false }),
      "admin-user-id",
      "ADMIN",
      "enrollment-id"
    );

    assert.equal(access, true);
  });

  test("blocks tutor enrollment access until tutor assignment phase", async () => {
    const access = await canAccessEnrollmentWithClient(
      createEnrollmentAccessClient({ enrollmentFound: true }),
      "tutor-user-id",
      "TUTOR",
      "enrollment-id"
    );

    assert.equal(access, false);
  });
});

describe("canAccessPayment", () => {
  test("allows parent access to own payment", async () => {
    const access = await canAccessPaymentWithClient(
      createPaymentAccessClient({ paymentFound: true }),
      "parent-user-id",
      "PARENT",
      "payment-id"
    );

    assert.equal(access, true);
  });

  test("blocks parent access to another parent's payment", async () => {
    const access = await canAccessPaymentWithClient(
      createPaymentAccessClient({ paymentFound: false }),
      "other-parent-user-id",
      "PARENT",
      "payment-id"
    );

    assert.equal(access, false);
  });

  test("allows admin access to any payment", async () => {
    const access = await canAccessPaymentWithClient(
      createPaymentAccessClient({ paymentFound: false }),
      "admin-user-id",
      "ADMIN",
      "payment-id"
    );

    assert.equal(access, true);
  });

  test("blocks tutor payment access in the payment workflow", async () => {
    const access = await canAccessPaymentWithClient(
      createPaymentAccessClient({ paymentFound: true }),
      "tutor-user-id",
      "TUTOR",
      "payment-id"
    );

    assert.equal(access, false);
  });
});

describe("canAccessLesson", () => {
  test("parent can access own child's lesson", async () => {
    const access = await canAccessLessonWithClient(
      createLessonAccessClient({ lessonFound: true }),
      "parent-user-id",
      "PARENT",
      "lesson-id"
    );

    assert.equal(access, true);
  });

  test("parent cannot access another parent's lesson", async () => {
    const access = await canAccessLessonWithClient(
      createLessonAccessClient({ lessonFound: false }),
      "other-parent-user-id",
      "PARENT",
      "lesson-id"
    );

    assert.equal(access, false);
  });

  test("tutor can access assigned lesson", async () => {
    const access = await canAccessLessonWithClient(
      createLessonAccessClient({ lessonFound: true }),
      "tutor-user-id",
      "TUTOR",
      "lesson-id"
    );

    assert.equal(access, true);
  });

  test("tutor cannot access unassigned lesson", async () => {
    const access = await canAccessLessonWithClient(
      createLessonAccessClient({ lessonFound: false }),
      "other-tutor-user-id",
      "TUTOR",
      "lesson-id"
    );

    assert.equal(access, false);
  });

  test("admin can access all lessons", async () => {
    const access = await canAccessLessonWithClient(
      createLessonAccessClient({ lessonFound: false }),
      "admin-user-id",
      "ADMIN",
      "lesson-id"
    );

    assert.equal(access, true);
  });
});
