import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createFlutterwavePaymentAdapter } from "@/server/integrations/payments/flutterwave.adapter";
import { createManualPaymentAdapter } from "@/server/integrations/payments/manual.adapter";

const checkoutInput = {
  paymentId: "payment-id",
  enrollmentId: "enrollment-id",
  parentId: "parent-id",
  studentId: "student-id",
  amount: "125.00",
  currency: "USD",
  redirectUrl: "https://topmox.test/payment/callback",
  customer: {
    email: "parent@example.com",
    name: "Ada Parent"
  }
};

describe("payment provider adapters", () => {
  test("Flutterwave adapter creates checkout with normalized metadata", async () => {
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    const adapter = createFlutterwavePaymentAdapter(
      {
        publicKey: "FLWPUBK_TEST",
        secretKey: "FLWSECK_TEST",
        secretHash: "hash",
        baseUrl: "https://api.flutterwave.com/v3"
      },
      async (url, init) => {
        requests.push({
          url: String(url),
          body: JSON.parse(String(init?.body))
        });

        return new Response(
          JSON.stringify({
            status: "success",
            data: {
              link: "https://checkout.flutterwave.com/pay/topmox",
              tx_ref: "topmox-payment-id"
            }
          }),
          { status: 200 }
        );
      }
    );

    const result = await adapter.createCheckout(checkoutInput);

    assert.equal(adapter.provider, "FLUTTERWAVE");
    assert.equal(result.provider, "FLUTTERWAVE");
    assert.equal(result.checkoutUrl, "https://checkout.flutterwave.com/pay/topmox");
    assert.equal(result.providerReference, "topmox-payment-id");
    assert.equal(requests[0]?.url, "https://api.flutterwave.com/v3/payments");
    assert.deepEqual(requests[0]?.body.metadata, {
      paymentId: "payment-id",
      enrollmentId: "enrollment-id",
      parentId: "parent-id",
      studentId: "student-id"
    });
  });

  test("Flutterwave adapter fails clearly when keys are missing", async () => {
    const adapter = createFlutterwavePaymentAdapter({
      publicKey: "",
      secretKey: "",
      secretHash: "",
      baseUrl: "https://api.flutterwave.com/v3"
    });

    await assert.rejects(
      () => adapter.createCheckout(checkoutInput),
      /Flutterwave payment configuration is incomplete/
    );
  });

  test("manual adapter never auto-activates enrollment", async () => {
    const adapter = createManualPaymentAdapter();
    const result = await adapter.createCheckout({
      ...checkoutInput,
      currency: "GBP"
    });

    assert.equal(adapter.provider, "MANUAL");
    assert.equal(result.provider, "MANUAL");
    assert.equal(result.status, "AWAITING_VERIFICATION");
    assert.equal(result.checkoutUrl, null);
    assert.equal(result.shouldActivateEnrollment, false);
  });
});
