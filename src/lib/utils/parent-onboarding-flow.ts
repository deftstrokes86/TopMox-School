export type ParentOnboardingFlowInput = {
  hasParentProfile: boolean;
  hasChildren: boolean;
};

export type ParentOnboardingFlowState =
  | "PARENT_PROFILE_NEEDED"
  | "CHILD_PROFILE_NEEDED"
  | "READY_FOR_ASSESSMENT";

export type ParentOnboardingFlowContent = {
  state: ParentOnboardingFlowState;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  activeStep: 1 | 2 | 3;
  profileSaved: boolean;
  hasChildProfiles: boolean;
};

export function resolveParentOnboardingFlow({
  hasParentProfile,
  hasChildren
}: ParentOnboardingFlowInput): ParentOnboardingFlowContent {
  if (!hasParentProfile) {
    return {
      state: "PARENT_PROFILE_NEEDED",
      title: "Complete your parent profile",
      description:
        "Add your contact and timezone details so TopMox can coordinate support around your family.",
      ctaLabel: "Complete Parent Profile",
      ctaHref: "/parent/onboarding",
      activeStep: 1,
      profileSaved: false,
      hasChildProfiles: false
    };
  }

  if (!hasChildren) {
    return {
      state: "CHILD_PROFILE_NEEDED",
      title: "Add your child profile",
      description:
        "Your parent profile is saved. Next, add your child's learning details so TopMox can prepare the right academic support.",
      ctaLabel: "Add Child Profile",
      ctaHref: "/parent/children/new",
      activeStep: 2,
      profileSaved: true,
      hasChildProfiles: false
    };
  }

  return {
    state: "READY_FOR_ASSESSMENT",
    title: "Your family profile is ready",
    description:
      "Your family profile is ready. Next, you can request a child assessment.",
    ctaLabel: "Book a Child Assessment",
    ctaHref: "/book-assessment",
    activeStep: 3,
    profileSaved: true,
    hasChildProfiles: true
  };
}
