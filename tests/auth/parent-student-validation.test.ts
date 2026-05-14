import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { parentProfileSchema } from "@/lib/validations/parent.schema";
import { childProfileSchema } from "@/lib/validations/student.schema";

describe("parent and student validation schemas", () => {
  test("parent schema rejects missing required fields", () => {
    const result = parentProfileSchema.safeParse({
      fullName: "",
      email: "invalid-email",
      whatsappNumber: "",
      country: "",
      timezone: "",
      preferredContactMethod: undefined
    });

    assert.equal(result.success, false);
  });

  test("child schema rejects missing required fields", () => {
    const result = childProfileSchema.safeParse({
      fullName: "",
      age: 0,
      classYearGroup: "",
      countryOfStudy: "",
      curriculum: "",
      subjectsNeedingSupport: [],
      mainAcademicChallenge: "",
      academicGoal: "",
      preferredLessonDays: [],
      preferredLessonTime: ""
    });

    assert.equal(result.success, false);
  });
});
