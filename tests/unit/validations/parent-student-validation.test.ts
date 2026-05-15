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

  test("parent schema accepts a complete onboarding profile", () => {
    const result = parentProfileSchema.safeParse({
      fullName: "Ada Okafor",
      email: "ada@example.com",
      whatsappNumber: "+2348012345678",
      country: "Nigeria",
      timezone: "Africa/Lagos",
      preferredContactMethod: "WHATSAPP",
      heardAboutTopMox: "School referral"
    });

    assert.equal(result.success, true);
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

  test("child schema requires child full name", () => {
    const result = childProfileSchema.safeParse({
      fullName: "",
      age: 9,
      classYearGroup: "Primary 4",
      countryOfStudy: "Nigeria",
      curriculum: "Nigerian",
      subjectsNeedingSupport: ["mathematics"],
      mainAcademicChallenge: "Slow with word problems",
      academicGoal: "Improve confidence and accuracy",
      preferredLessonDays: ["Monday"],
      preferredLessonTime: "5:00 PM WAT"
    });

    assert.equal(result.success, false);
  });

  test("child schema accepts a complete profile and coerces age input", () => {
    const result = childProfileSchema.safeParse({
      fullName: "Tomi Ade",
      age: "11",
      classYearGroup: "Year 6",
      countryOfStudy: "United Kingdom",
      curriculum: "British",
      subjectsNeedingSupport: ["mathematics", "english"],
      mainAcademicChallenge: "Needs more structure with word problems",
      academicGoal: "Build confidence and improve independent study habits",
      preferredLessonDays: ["Monday", "Wednesday"],
      preferredLessonTime: "6:00 PM BST"
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.age, 11);
    }
  });

  test("child schema requires at least one subject", () => {
    const result = childProfileSchema.safeParse({
      fullName: "Fisayo Ade",
      age: 10,
      classYearGroup: "Primary 5",
      countryOfStudy: "United Kingdom",
      curriculum: "British",
      subjectsNeedingSupport: [],
      mainAcademicChallenge: "Reading pace",
      academicGoal: "Better comprehension confidence",
      preferredLessonDays: ["Tuesday"],
      preferredLessonTime: "6:00 PM BST"
    });

    assert.equal(result.success, false);
  });

  test("child schema rejects invalid age", () => {
    const result = childProfileSchema.safeParse({
      fullName: "Ireti Cole",
      age: -1,
      classYearGroup: "Year 7",
      countryOfStudy: "Canada",
      curriculum: "Ontario",
      subjectsNeedingSupport: ["science"],
      mainAcademicChallenge: "Applied science questions",
      academicGoal: "Stronger exam readiness",
      preferredLessonDays: ["Thursday"],
      preferredLessonTime: "7:00 PM EST"
    });

    assert.equal(result.success, false);
  });
});
