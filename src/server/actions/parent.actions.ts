"use server";

import type { Prisma } from "@prisma/client";

import { AuthError, requireParent } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  parentProfileSchema,
  type ParentProfileInput
} from "@/lib/validations/parent.schema";
import {
  getCurrentParentProfile,
  getParentOnboardingStatus
} from "@/server/queries/parent.queries";

type ParentProfileFieldErrors = Partial<Record<keyof ParentProfileInput, string>>;

export type ParentProfileActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: ParentProfileFieldErrors;
  data?: {
    parentProfileId: string;
    onboardingComplete: boolean;
  };
};

export type ParentOnboardingStatusActionResult = {
  success: boolean;
  message: string;
  data?: Awaited<ReturnType<typeof getParentOnboardingStatus>>;
};

export type CurrentParentProfileActionResult = {
  success: boolean;
  message: string;
  data?: Awaited<ReturnType<typeof getCurrentParentProfile>>;
};

export async function upsertParentProfileAction(
  payload: ParentProfileInput
): Promise<ParentProfileActionResult> {
  try {
    const parsed = parentProfileSchema.safeParse(payload);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please check the highlighted fields and try again.",
        fieldErrors: {
          fullName: flattened.fullName?.[0],
          email: flattened.email?.[0],
          whatsappNumber: flattened.whatsappNumber?.[0],
          country: flattened.country?.[0],
          timezone: flattened.timezone?.[0],
          preferredContactMethod: flattened.preferredContactMethod?.[0],
          heardAboutTopMox: flattened.heardAboutTopMox?.[0]
        }
      };
    }

    const user = await requireParent();
    const data = parsed.data;
    const normalizedEmail = data.email.trim().toLowerCase();
    const heardAboutTopMox = data.heardAboutTopMox?.trim() || null;

    const conflictingUser = await db.user.findFirst({
      where: {
        email: normalizedEmail,
        id: {
          not: user.id
        }
      },
      select: { id: true }
    });

    if (conflictingUser) {
      return {
        success: false,
        message: "This email is already in use by another account.",
        fieldErrors: {
          email: "This email is already in use by another account."
        }
      };
    }

    const parentProfile = await db.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            name: data.fullName.trim(),
            email: normalizedEmail
          },
          select: { id: true }
        });

        await tx.profile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            phone: data.whatsappNumber.trim(),
            country: data.country.trim(),
            timezone: data.timezone.trim()
          },
          update: {
            phone: data.whatsappNumber.trim(),
            country: data.country.trim(),
            timezone: data.timezone.trim()
          },
          select: { id: true }
        });

        return tx.parentProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            whatsappNumber: data.whatsappNumber.trim(),
            country: data.country.trim(),
            timezone: data.timezone.trim(),
            preferredContactMethod: data.preferredContactMethod,
            heardAboutTopMox
          },
          update: {
            whatsappNumber: data.whatsappNumber.trim(),
            country: data.country.trim(),
            timezone: data.timezone.trim(),
            preferredContactMethod: data.preferredContactMethod,
            heardAboutTopMox
          },
          select: {
            id: true,
            _count: {
              select: { students: true }
            }
          }
        });
      }
    );

    return {
      success: true,
      message: "Parent profile saved successfully.",
      data: {
        parentProfileId: parentProfile.id,
        onboardingComplete: parentProfile._count.students > 0
      }
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          error.code === "UNAUTHENTICATED"
            ? "Authentication required."
            : "You do not have permission to update this parent profile."
      };
    }

    return {
      success: false,
      message: "Unable to save parent profile right now. Please try again."
    };
  }
}

export async function getParentOnboardingStatusAction(): Promise<ParentOnboardingStatusActionResult> {
  try {
    const onboardingStatus = await getParentOnboardingStatus();

    return {
      success: true,
      message: "Parent onboarding status loaded.",
      data: onboardingStatus
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          error.code === "UNAUTHENTICATED"
            ? "Authentication required."
            : "You do not have permission to view onboarding status."
      };
    }

    throw error;
  }
}

export async function getCurrentParentProfileAction(): Promise<CurrentParentProfileActionResult> {
  try {
    const parentProfile = await getCurrentParentProfile();

    return {
      success: true,
      message: "Parent profile loaded.",
      data: parentProfile
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          error.code === "UNAUTHENTICATED"
            ? "Authentication required."
            : "You do not have permission to view this parent profile."
      };
    }

    throw error;
  }
}
