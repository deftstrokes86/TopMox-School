import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assessmentOutcomeAdminSelect,
  assessmentOutcomeParentSelect,
  assessmentRequestAdminSelect,
  assessmentRequestParentSelect
} from "@/server/queries/assessment.queries";

describe("assessment data shaping", () => {
  test("parent assessment queries exclude admin-only operational fields", () => {
    assert.equal("internalNotes" in assessmentRequestParentSelect, false);
    assert.equal("communicationLogs" in assessmentRequestParentSelect, false);
  });

  test("admin assessment queries retain operational review fields", () => {
    assert.equal("internalNotes" in assessmentRequestAdminSelect, true);
    assert.equal("communicationLogs" in assessmentRequestAdminSelect, true);
  });

  test("parent assessment outcomes exclude internal admin notes", () => {
    assert.equal("internalAdminNotes" in assessmentOutcomeParentSelect, false);
    assert.equal("internalAdminNotes" in assessmentOutcomeAdminSelect, true);
  });
});
