import { PrismaClient } from "@prisma/client";

/**
 * Performs a lightweight connectivity check against the configured database.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error("Database connectivity check failed:", error);
    return false;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error(
        "Database connectivity check disconnect failed:",
        disconnectError
      );
    }
  }
}

