"use server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  forgotPasswordSchema,
  registerSchema,
  type ForgotPasswordInput,
  type RegisterInput
} from "@/lib/validations/auth.schema";

type FieldErrors = Partial<Record<keyof RegisterInput | "email", string>>;

export type AuthActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: FieldErrors;
};

export async function registerParentAction(
  payload: RegisterInput
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please check the highlighted fields and try again.",
      fieldErrors: {
        fullName: flattened.fullName?.[0],
        email: flattened.email?.[0],
        password: flattened.password?.[0],
        confirmPassword: flattened.confirmPassword?.[0]
      }
    };
  }

  const { fullName, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true }
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
      fieldErrors: {
        email: "An account with this email already exists."
      }
    };
  }

  const passwordHash = await hashPassword(password);

  await db.user.create({
    data: {
      name: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "PARENT"
    },
    select: { id: true }
  });

  return {
    success: true,
    message: "Your parent account has been created. You can now sign in."
  };
}

export async function forgotPasswordAction(
  payload: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please provide a valid email address.",
      fieldErrors: {
        email: parsed.error.flatten().fieldErrors.email?.[0]
      }
    };
  }

  // Placeholder only for Phase 3B: no outbound email integration yet.
  return {
    success: true,
    message: "If an account exists, reset instructions will be sent."
  };
}
