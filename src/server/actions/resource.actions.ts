"use server";

import type { ResourceStatus } from "@prisma/client";

import { AuthError, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createResourceSchema,
  updateResourceSchema,
  updateResourceStatusSchema,
  type CreateResourceInput,
  type UpdateResourceInput,
  type UpdateResourceStatusInput
} from "@/lib/validations/resource.schema";
import {
  ResourceAccessError,
  ResourceSlugError,
  archiveResource,
  assertCanManageResources,
  createResource,
  publishResource,
  updateResource
} from "@/server/services/resource.service";

type ResourceFieldErrors = Partial<
  Record<keyof (CreateResourceInput & UpdateResourceInput), string>
>;

export type ResourceActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: ResourceFieldErrors;
  data?: {
    resourceId: string;
    slug: string;
    status: ResourceStatus;
  };
};

function createResourceFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
): ResourceFieldErrors {
  return {
    resourceId: fieldErrors.resourceId?.[0],
    title: fieldErrors.title?.[0],
    slug: fieldErrors.slug?.[0],
    excerpt: fieldErrors.excerpt?.[0],
    content: fieldErrors.content?.[0],
    category: fieldErrors.category?.[0],
    status: fieldErrors.status?.[0]
  };
}

function toResourceActionData(resource: unknown): ResourceActionResult["data"] {
  const value = resource as {
    id: string;
    slug: string;
    status: ResourceStatus;
  };

  return {
    resourceId: value.id,
    slug: value.slug,
    status: value.status
  };
}

function toAuthErrorResult(error: unknown): ResourceActionResult | null {
  if (error instanceof AuthError) {
    return {
      success: false,
      message:
        error.code === "UNAUTHENTICATED"
          ? "Authentication required."
          : "Only admins can manage resources."
    };
  }

  return null;
}

function toResourceErrorResult(error: unknown): ResourceActionResult | null {
  if (error instanceof ResourceSlugError || error instanceof ResourceAccessError) {
    return {
      success: false,
      message: error.message
    };
  }

  return null;
}

export async function createResourceAction(
  payload: CreateResourceInput
): Promise<ResourceActionResult> {
  try {
    const parsed = createResourceSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the resource fields and try again.",
        fieldErrors: createResourceFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    const user = await requireAdmin();
    assertCanManageResources(user.role);

    const resource = await createResource(db, {
      ...parsed.data,
      authorId: user.id
    });

    return {
      success: true,
      message: "Resource created.",
      data: toResourceActionData(resource)
    };
  } catch (error) {
    const authResult = toAuthErrorResult(error);
    if (authResult) {
      return authResult;
    }

    const resourceResult = toResourceErrorResult(error);
    if (resourceResult) {
      return resourceResult;
    }

    throw error;
  }
}

export async function updateResourceAction(
  payload: UpdateResourceInput
): Promise<ResourceActionResult> {
  try {
    const parsed = updateResourceSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the resource fields and try again.",
        fieldErrors: createResourceFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    const user = await requireAdmin();
    assertCanManageResources(user.role);

    const resource = await updateResource(db, parsed.data);

    return {
      success: true,
      message: "Resource updated.",
      data: toResourceActionData(resource)
    };
  } catch (error) {
    const authResult = toAuthErrorResult(error);
    if (authResult) {
      return authResult;
    }

    const resourceResult = toResourceErrorResult(error);
    if (resourceResult) {
      return resourceResult;
    }

    throw error;
  }
}

export async function publishResourceAction(
  payload: Pick<UpdateResourceStatusInput, "resourceId">
): Promise<ResourceActionResult> {
  return updateResourceStatusAction({
    ...payload,
    status: "PUBLISHED"
  });
}

export async function archiveResourceAction(
  payload: Pick<UpdateResourceStatusInput, "resourceId">
): Promise<ResourceActionResult> {
  return updateResourceStatusAction({
    ...payload,
    status: "ARCHIVED"
  });
}

async function updateResourceStatusAction(
  payload: UpdateResourceStatusInput
): Promise<ResourceActionResult> {
  try {
    const parsed = updateResourceStatusSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please choose a valid resource.",
        fieldErrors: createResourceFieldErrors(
          parsed.error.flatten().fieldErrors
        )
      };
    }

    const user = await requireAdmin();
    assertCanManageResources(user.role);

    const resource =
      parsed.data.status === "PUBLISHED"
        ? await publishResource(db, parsed.data.resourceId)
        : await archiveResource(db, parsed.data.resourceId);

    return {
      success: true,
      message:
        parsed.data.status === "PUBLISHED"
          ? "Resource published."
          : "Resource archived.",
      data: toResourceActionData(resource)
    };
  } catch (error) {
    const authResult = toAuthErrorResult(error);
    if (authResult) {
      return authResult;
    }

    const resourceResult = toResourceErrorResult(error);
    if (resourceResult) {
      return resourceResult;
    }

    throw error;
  }
}
