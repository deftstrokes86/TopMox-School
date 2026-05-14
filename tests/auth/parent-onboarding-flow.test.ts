import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolveParentOnboardingFlow } from "@/lib/utils/parent-onboarding-flow";

describe("resolveParentOnboardingFlow", () => {
  test("returns parent-profile-needed when ParentProfile is missing", () => {
    const flow = resolveParentOnboardingFlow({
      hasParentProfile: false,
      hasChildren: false
    });

    assert.equal(flow.state, "PARENT_PROFILE_NEEDED");
    assert.equal(flow.ctaHref, "/parent/onboarding");
    assert.equal(flow.activeStep, 1);
  });

  test("returns child-profile-needed when ParentProfile exists without children", () => {
    const flow = resolveParentOnboardingFlow({
      hasParentProfile: true,
      hasChildren: false
    });

    assert.equal(flow.state, "CHILD_PROFILE_NEEDED");
    assert.equal(flow.ctaHref, "/parent/children/new");
    assert.equal(flow.activeStep, 2);
  });

  test("returns ready-for-assessment when ParentProfile and child profile exist", () => {
    const flow = resolveParentOnboardingFlow({
      hasParentProfile: true,
      hasChildren: true
    });

    assert.equal(flow.state, "READY_FOR_ASSESSMENT");
    assert.equal(flow.ctaHref, "/book-assessment");
    assert.equal(flow.activeStep, 3);
  });
});
