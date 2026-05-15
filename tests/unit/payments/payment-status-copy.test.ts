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

  test("Flutterwave pending copy points parent back to checkout", () => {
    assert.equal(
      getParentPaymentStatusDescription({
        paymentMethod: "FLUTTERWAVE",
        status: "PENDING"
      }),
      "Checkout pending. Continue payment."
    );
  });

  test("Flutterwave failed copy avoids manual-review wording", () => {
    assert.equal(
      getParentPaymentStatusDescription({
        paymentMethod: "FLUTTERWAVE",
        status: "FAILED"
      }),
      "Payment was not completed or could not be verified."
    );
  });
});
