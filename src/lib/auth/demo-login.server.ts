import { db } from "@/lib/db";

import {
  DEMO_LOGIN_ACCOUNTS,
  getDemoLoginAccountForRole,
  isDemoLoginVisible,
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

export type DemoLoginReadinessReason =
  | "ready"
  | "public-disabled"
  | "server-disabled"
  | "database-unavailable"
  | "account-missing"
  | "password-mismatch"
  | "profile-missing";

export type DemoLoginReadiness = {
  available: boolean;
  reason: DemoLoginReadinessReason;
  message: string;
};

const DEMO_LOGIN_DISABLED_MESSAGE = "Demo login is disabled in this environment.";
const DEMO_LOGIN_READY_MESSAGE = "Demo login is ready.";
const DEMO_LOGIN_DATABASE_MESSAGE = "Database unavailable. Check /api/health.";
const DEMO_LOGIN_ACCOUNT_MISSING_MESSAGE =
  "Demo account is missing. Run npm run prisma:seed.";
const DEMO_LOGIN_PASSWORD_MISMATCH_MESSAGE =
  "Demo password mismatch. Rerun seed with DEMO_USER_PASSWORD configured.";
const DEMO_LOGIN_PROFILE_MISSING_MESSAGE =
  "Demo account profile is missing. Run npm run prisma:seed.";

export function isDemoLoginServerEnabled(): boolean {
  return parseDemoLoginEnabled(process.env.DEMO_LOGIN_ENABLED);
}

function demoLoginReadiness(
  available: boolean,
  reason: DemoLoginReadinessReason,
  message: string
): DemoLoginReadiness {
  return { available, reason, message };
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

function validateDemoUserReadiness(
  role: AppRole,
  expectedEmail: string,
  user: DemoLoginUserRecord | null
): DemoLoginReadiness | null {
  if (!user || user.email.toLowerCase() !== expectedEmail || user.role !== role) {
    return demoLoginReadiness(
      false,
      "account-missing",
      DEMO_LOGIN_ACCOUNT_MISSING_MESSAGE
    );
  }

  if (!user.passwordHash || !isScryptPasswordHash(user.passwordHash)) {
    return demoLoginReadiness(
      false,
      "password-mismatch",
      DEMO_LOGIN_PASSWORD_MISMATCH_MESSAGE
    );
  }

  if (!hasRequiredDemoSeedData(role, user)) {
    return demoLoginReadiness(
      false,
      "profile-missing",
      DEMO_LOGIN_PROFILE_MISSING_MESSAGE
    );
  }

  return null;
}

async function findDemoUser(
  email: string,
  repository: DemoLoginRepository
): Promise<DemoLoginUserRecord | null> {
  return repository.user.findUnique({
    where: { email },
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
}

export async function getDemoLoginReadiness(
  repository: DemoLoginRepository = db as unknown as DemoLoginRepository
): Promise<DemoLoginReadiness> {
  if (!isDemoLoginVisible()) {
    return demoLoginReadiness(
      false,
      "public-disabled",
      DEMO_LOGIN_DISABLED_MESSAGE
    );
  }

  if (!isDemoLoginServerEnabled()) {
    return demoLoginReadiness(
      false,
      "server-disabled",
      DEMO_LOGIN_DISABLED_MESSAGE
    );
  }

  try {
    for (const account of DEMO_LOGIN_ACCOUNTS) {
      const user = await findDemoUser(account.email, repository);
      const readinessFailure = validateDemoUserReadiness(
        account.role,
        account.email,
        user
      );

      if (readinessFailure) {
        return readinessFailure;
      }
    }
  } catch (error) {
    console.error("Demo login readiness database query failed:", { error });
    return demoLoginReadiness(
      false,
      "database-unavailable",
      DEMO_LOGIN_DATABASE_MESSAGE
    );
  }

  return demoLoginReadiness(true, "ready", DEMO_LOGIN_READY_MESSAGE);
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
    user = await findDemoUser(account.email, repository);
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

  if (validateDemoUserReadiness(account.role, account.email, user)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: account.role
  };
}
