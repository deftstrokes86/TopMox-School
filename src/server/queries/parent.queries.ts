import { requireParent } from "@/lib/auth";
import { db } from "@/lib/db";

export type ParentOnboardingStep =
  | "CREATE_PARENT_PROFILE"
  | "CREATE_CHILD_PROFILE"
  | "READY";

export type ParentOnboardingStatus = {
  hasParentProfile: boolean;
  hasChildren: boolean;
  childrenCount: number;
  isComplete: boolean;
  requiresOnboarding: boolean;
  nextStep: ParentOnboardingStep;
  redirectPath: "/parent/onboarding" | null;
};

async function getParentProfileByUserId(userId: string) {
  return db.parentProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      whatsappNumber: true,
      country: true,
      timezone: true,
      preferredContactMethod: true,
      heardAboutTopMox: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function getCurrentParentProfile() {
  const user = await requireParent();
  return getParentProfileByUserId(user.id);
}

async function getParentOnboardingStatusByUserId(
  userId: string
): Promise<ParentOnboardingStatus> {
  const parentProfile = await db.parentProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      _count: {
        select: {
          students: true
        }
      }
    }
  });

  if (!parentProfile) {
    return {
      hasParentProfile: false,
      hasChildren: false,
      childrenCount: 0,
      isComplete: false,
      requiresOnboarding: true,
      nextStep: "CREATE_PARENT_PROFILE",
      redirectPath: "/parent/onboarding"
    };
  }

  const childrenCount = parentProfile._count.students;
  const hasChildren = childrenCount > 0;

  if (!hasChildren) {
    return {
      hasParentProfile: true,
      hasChildren: false,
      childrenCount,
      isComplete: false,
      requiresOnboarding: true,
      nextStep: "CREATE_CHILD_PROFILE",
      redirectPath: "/parent/onboarding"
    };
  }

  return {
    hasParentProfile: true,
    hasChildren: true,
    childrenCount,
    isComplete: true,
    requiresOnboarding: false,
    nextStep: "READY",
    redirectPath: null
  };
}

export async function getParentOnboardingStatus(): Promise<ParentOnboardingStatus> {
  const user = await requireParent();
  return getParentOnboardingStatusByUserId(user.id);
}

export async function getParentDashboardShellData() {
  const user = await requireParent();
  const [parentProfile, onboardingStatus] = await Promise.all([
    getParentProfileByUserId(user.id),
    getParentOnboardingStatusByUserId(user.id)
  ]);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    parentProfile,
    onboardingStatus
  };
}
