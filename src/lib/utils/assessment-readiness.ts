export type BookAssessmentReadinessInput = {
  hasParentProfile: boolean;
  hasChildren: boolean;
};

export type BookAssessmentReadinessState =
  | "PARENT_PROFILE_REQUIRED"
  | "CHILD_PROFILE_REQUIRED"
  | "READY";

export type BookAssessmentReadiness = {
  state: BookAssessmentReadinessState;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string | null;
};

export function resolveBookAssessmentReadiness({
  hasParentProfile,
  hasChildren
}: BookAssessmentReadinessInput): BookAssessmentReadiness {
  if (!hasParentProfile) {
    return {
      state: "PARENT_PROFILE_REQUIRED",
      title: "Complete your parent profile first",
      description:
        "TopMox needs your contact, country, and timezone details before coordinating an assessment.",
      ctaLabel: "Complete Parent Profile",
      ctaHref: "/parent/onboarding"
    };
  }

  if (!hasChildren) {
    return {
      state: "CHILD_PROFILE_REQUIRED",
      title: "Add a child profile first",
      description:
        "Create your child's learning profile so the assessment request is attached to the right learner.",
      ctaLabel: "Add Child Profile",
      ctaHref: "/parent/children/new"
    };
  }

  return {
    state: "READY",
    title: "Ready to request an assessment",
    description:
      "Choose your child, share the academic concern, and TopMox will review the request before recommending the next step.",
    ctaLabel: "Book Assessment",
    ctaHref: null
  };
}

