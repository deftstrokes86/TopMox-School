import { NextRequest, NextResponse } from "next/server";

import { processFlutterwaveCallback } from "@/server/services/payment.service";

export const dynamic = "force-dynamic";

function getCallbackRedirectUrl(request: NextRequest, paymentId?: string) {
  const redirectUrl = new URL(
    paymentId ? `/parent/payments/${paymentId}` : "/parent/payments",
    request.nextUrl.origin
  );

  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const transactionId =
    request.nextUrl.searchParams.get("transaction_id") ??
    request.nextUrl.searchParams.get("transactionId");
  const txRef = request.nextUrl.searchParams.get("tx_ref");
  const queryStatus = request.nextUrl.searchParams.get("status");

  try {
    const result = await processFlutterwaveCallback({
      transactionId,
      txRef,
      queryStatus
    });
    const redirectUrl = getCallbackRedirectUrl(request, result.paymentId);

    redirectUrl.searchParams.set(
      "flutterwave",
      result.success ? "verified" : "review"
    );

    if (result.reason) {
      redirectUrl.searchParams.set("reason", result.reason);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Flutterwave callback processing failed:", error);

    const redirectUrl = getCallbackRedirectUrl(request);
    redirectUrl.searchParams.set("flutterwave", "error");

    return NextResponse.redirect(redirectUrl);
  }
}
