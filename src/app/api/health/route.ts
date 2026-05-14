import { NextResponse } from "next/server";

import { checkDatabaseConnection } from "@/lib/db/connection-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const isConnected = await checkDatabaseConnection();

  if (isConnected) {
    return NextResponse.json(
      { status: "ok", database: "connected" },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { status: "error", database: "disconnected" },
    { status: 503 }
  );
}
