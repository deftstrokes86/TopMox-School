import { NextRequest, NextResponse } from "next/server";

import { PaymentProviderConfigurationError } from "@/server/integrations/payments/payment-provider";
import { processFlutterwaveWebhook } from "@/server/services/payment.service";

export const dynamic = "force-dynamic";

function getHeadersObject(request: NextRequest) {
  return Object.fromEntries(request.headers.entries());
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Invalid webhook payload."
      },
      { status: 400 }
    );
  }

  try {
    const result = await processFlutterwaveWebhook({
      headers: getHeadersObject(request),
      payload
    });

    return NextResponse.json({
      status: "ok",
      duplicate: Boolean(result.duplicate),
      activated: result.activated,
      paymentId: result.paymentId ?? null,
      eventId: result.eventId ?? null
    });
  } catch (error) {
    if (error instanceof PaymentProviderConfigurationError) {
      console.error("Flutterwave webhook configuration error:", error);

      return NextResponse.json(
        {
          status: "error",
          message: "Flutterwave webhook is not configured."
        },
        { status: 503 }
      );
    }

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("webhook verification failed")
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Webhook verification failed."
        },
        { status: 401 }
      );
    }

    console.error("Flutterwave webhook processing failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Webhook processing failed."
      },
      { status: 500 }
    );
  }
}
