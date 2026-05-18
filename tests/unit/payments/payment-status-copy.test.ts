import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getParentPaymentStatusDescription } from "@/lib/utils/payment-status";

describe("parent payment status copy", () => {
  test("manual awaiting verification explains TopMox review", () => {
    assert.equal(
      getParentPaymentStatusDescription({
        paymentMethod: "MANUAL_TRANSFER",
        status: "AWAITING_VERIFICATION"
      }),
      "TopMox is reviewing your payment details."
    );
  });

  test("manual approved copy says tutoring plan is active", () => {
    assert.equal(
      getParentPaymentStatusDescription({
        paymentMethod: "MANUAL_TRANSFER",
        status: "PAID"
      }),
      "Payment approved. Your tutoring plan is active."
    );
  });

  test("online checkout pending copy points parent back to checkout without provider marketing", () => {
    const copy = getParentPaymentStatusDescription({
        paymentMethod: "FLUTTERWAVE",
        status: "PENDING"
      });

    assert.equal(copy, "Checkout pending. Continue payment.");
    assert.doesNotMatch(copy, /Flutterwave/i);
  });

  test("online checkout failed copy avoids manual-review wording and provider marketing", () => {
    const copy = getParentPaymentStatusDescription({
        paymentMethod: "FLUTTERWAVE",
        status: "FAILED"
      });

    assert.equal(copy, "Payment was not completed or could not be verified.");
    assert.doesNotMatch(copy, /Flutterwave/i);
  });
});
