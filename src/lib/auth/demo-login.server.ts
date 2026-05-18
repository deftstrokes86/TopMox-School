import { db } from "@/lib/db";

import {
  getDemoLoginAccountForRole,
  parseDemoLoginEnabled
} from "./demo-login";
import { isScryptPasswordHash } from "./password";
import type { AppRole, AuthUser } from "./types";

type DemoLoginUserRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string | null;
  parentProfile: {
    id: string;
    students: Array<{ id: string }>;
  } | null;
  tutorProfile: {
    id: string;
  } | null;
};

export type DemoLoginRepository = {
  user: {
    findUnique(args: {
      where: { email: string };
      select: {
        id: true;
        email: true;
        name: true;
        role: true;
        passwordHash: true;
        parentProfile: {
          select: {
            id: true;
            students: {
              select: { id: true };
              take: 1;
            };
          };
        };
        tutorProfile: {
          select: { id: true };
        };
      };
    }): Promise<DemoLoginUserRecord | null>;
  };
};

export function isDemoLoginServerEnabled(): boolean {
  return parseDemoLoginEnabled(process.env.DEMO_LOGIN_ENABLED);
}

function hasRequiredDemoSeedData(
  role: AppRole,
  user: DemoLoginUserRecord
): boolean {
  if (role === "PARENT") {
    return Boolean(user.parentProfile && user.parentProfile.students.length > 0);
  }

  if (role === "TUTOR") {
    return Boolean(user.tutorProfile);
  }

  return true;
}

export async function authorizeDemoLogin(
  role: unknown,
  repository: DemoLoginRepository = db as unknown as DemoLoginRepository
): Promise<AuthUser | null> {
  if (!isDemoLoginServerEnabled()) {
    return null;
  }

  const account = getDemoLoginAccountForRole(role);
  if (!account) {
    return null;
  }

  let user: DemoLoginUserRecord | null = null;

  try {
    user = await repository.user.findUnique({
      where: { email: account.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        parentProfile: {
          select: {
            id: true,
            students: {
              select: { id: true },
              take: 1
            }
          }
        },
        tutorProfile: {
          select: { id: true }
        }
      }
    });
  } catch (error) {
    console.error("Demo login database query failed:", {
      role: account.role,
      email: account.email,
      error
    });
    return null;
  }

  if (!user) {
    return null;
  }

  if (
    user.email.toLowerCase() !== account.email ||
    user.role !== account.role ||
    !user.passwordHash ||
    !isScryptPasswordHash(user.passwordHash) ||
    !hasRequiredDemoSeedData(account.role, user)
  ) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: account.role
  };
}
