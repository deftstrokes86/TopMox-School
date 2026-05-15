import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assessmentOutcomeAdminSelect,
  assessmentOutcomeParentSelect,
  buildAdminAssessmentWhereInput
} from "@/server/queries/assessment.queries";

describe("admin assessment query filters", () => {
  test("builds status filter for admin assessment list", () => {
    const where = buildAdminAssessmentWhereInput({
      status: "SCHEDULED"
    });

    assert.equal(where.status, "SCHEDULED");
  });

  test("builds parent, student, and subject filters", () => {
    const where = buildAdminAssessmentWhereInput({
      parentName: " Ada ",
      studentName: " Timi ",
      subjectSlug: "mathematics"
    });

    assert.deepEqual(where.AND, [
      {
        parent: {
          user: {
            name: {
              contains: "Ada",
              mode: "insensitive"
            }
          }
        }
      },
      {
        student: {
          fullName: {
            contains: "Timi",
            mode: "insensitive"
          }
        }
      },
      {
        subjects: {
          some: {
            slug: "mathematics"
          }
        }
      }
    ]);
  });

  test("parent outcome select does not include internal admin notes", () => {
    assert.equal("internalAdminNotes" in assessmentOutcomeParentSelect, false);
  });

  test("admin outcome select includes internal admin notes", () => {
    assert.equal("internalAdminNotes" in assessmentOutcomeAdminSelect, true);
  });
});
