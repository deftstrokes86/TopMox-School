import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createManualPaymentSchema } from "@/lib/validations/payment.schema";

const enrollmentId = "ckq9v7z7z0004x7p52u2v7h1q";

describe("manual payment validation schema", () => {
  test("requires enrollmentId", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId: undefined,
      paymentMethod: "BANK_TRANSFER"
    });

    assert.equal(result.success, false);
  });

  test("requires paymentMethod", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: undefined
    });

    assert.equal(result.success, false);
  });

  test("accepts optional reference and proofUrl", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "BANK_TRANSFER",
      reference: "TMX-001",
      proofUrl: "https://example.com/proof"
    });

    assert.equal(result.success, true);
  });

  test("does not accept client-submitted amount as trusted input", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "BANK_TRANSFER",
      amount: "1.00"
    });

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal("amount" in result.data, false);
    }
  });
});
