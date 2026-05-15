import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createEnrollmentPaymentSchema,
  createManualPaymentSchema,
  reviewPaymentSchema
} from "@/lib/validations/payment.schema";

const enrollmentId = "ckq9v7z7z0004x7p52u2v7h1q";
const paymentId = "ckq9v7z7z0005x7p52u2v7h1r";

describe("enrollment payment validation schema", () => {
  test("accepts Flutterwave checkout as the live payment method", () => {
    const result = createEnrollmentPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "FLUTTERWAVE"
    });

    assert.equal(result.success, true);
  });

  test("accepts manual transfer as the fallback payment method", () => {
    const result = createEnrollmentPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "MANUAL_TRANSFER",
      reference: "TMX-001",
      proofUrl: "https://example.com/proof"
    });

    assert.equal(result.success, true);
  });

  test("rejects unsupported payment methods such as Stripe", () => {
    const result = createEnrollmentPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "STRIPE"
    });

    assert.equal(result.success, false);
  });

  test("does not accept client-submitted amount or currency as trusted input", () => {
    const result = createEnrollmentPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "FLUTTERWAVE",
      amount: "1.00",
      currency: "USD"
    });

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal("amount" in result.data, false);
      assert.equal("currency" in result.data, false);
    }
  });
});

describe("manual payment validation schema", () => {
  test("requires enrollmentId", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId: undefined,
      paymentMethod: "MANUAL_TRANSFER"
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

  test("rejects invalid manual payment method", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "FLUTTERWAVE"
    });

    assert.equal(result.success, false);
  });

  test("accepts optional reference and proofUrl", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "MANUAL_TRANSFER",
      reference: "TMX-001",
      proofUrl: "https://example.com/proof"
    });

    assert.equal(result.success, true);
  });

  test("does not accept client-submitted amount as trusted input", () => {
    const result = createManualPaymentSchema.safeParse({
      enrollmentId,
      paymentMethod: "MANUAL_TRANSFER",
      amount: "1.00"
    });

    assert.equal(result.success, true);

    if (result.success) {
      assert.equal("amount" in result.data, false);
    }
  });
});

describe("payment review validation schema", () => {
  test("requires paymentId", () => {
    const result = reviewPaymentSchema.safeParse({
      paymentId: undefined,
      decision: "APPROVE"
    });

    assert.equal(result.success, false);
  });

  test("requires approve or reject decision", () => {
    const result = reviewPaymentSchema.safeParse({
      paymentId,
      decision: "MAYBE"
    });

    assert.equal(result.success, false);
  });

  test("rejection expects an admin note", () => {
    const result = reviewPaymentSchema.safeParse({
      paymentId,
      decision: "REJECT",
      adminNote: ""
    });

    assert.equal(result.success, false);
  });
});
