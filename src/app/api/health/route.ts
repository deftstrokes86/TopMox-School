import { NextResponse } from "next/server";

import { BRAND } from "@/lib/constants/brand";
import { checkDatabaseConnection } from "@/lib/db/connection-check";

export const dynamic = "force-dynamic";

export async function GET() {
  let isConnected = false;

  try {
    isConnected = await checkDatabaseConnection();
  } catch (error) {
    console.error("Health check database probe failed:", error);
  }

  return NextResponse.json(
    {
      status: isConnected ? "ok" : "degraded",
      app: BRAND.PRODUCT_NAME,
      timestamp: new Date().toISOString(),
      database: isConnected ? "connected" : "disconnected"
    },
    { status: 200 }
  );
}
