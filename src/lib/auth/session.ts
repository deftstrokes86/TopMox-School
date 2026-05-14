import { getServerSession } from "next-auth";

import { authOptions } from "./auth-options";
import { type AppRole, type AuthUser, isAppRole } from "./types";

export class AuthError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";

  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}

const toAuthUser = async (): Promise<AuthUser | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const { id, email, name, role } = session.user;
  if (!id || !email || !name || !isAppRole(role)) {
    return null;
  }

  return {
    id,
    email,
    name,
    role
  };
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  return toAuthUser();
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await toAuthUser();
  if (!user) {
    throw new AuthError("UNAUTHENTICATED", "Authentication required");
  }

  return user;
}

export async function requireRole(role: AppRole): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new AuthError("FORBIDDEN", "You do not have permission for this route");
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole("ADMIN");
}

export async function requireTutor(): Promise<AuthUser> {
  return requireRole("TUTOR");
}

export async function requireParent(): Promise<AuthUser> {
  return requireRole("PARENT");
}
