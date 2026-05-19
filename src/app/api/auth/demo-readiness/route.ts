import { NextResponse } from "next/server";

import { getDemoLoginReadiness } from "@/lib/auth/demo-login.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await getDemoLoginReadiness();

  return NextResponse.json(readiness);
}
