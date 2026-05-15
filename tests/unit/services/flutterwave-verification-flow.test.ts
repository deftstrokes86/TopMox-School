import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createFlutterwavePaymentAdapter } from "@/server/integrations/payments/flutterwave.adapter";
import {
  processFlutterwaveCallback,
  processFlutterwaveWebhook
} from "@/server/services/payment.service";

const pendingPayment = {
  id: "payment-id",
  provider: "FLUTTERWAVE" as const,
  providerReference: "topmox-payment-id",
  amount: "125.00",
  currency: "USD",
  status: "PENDING" as const,
  parent: {
    userId: "parent-user-id"
  },
  enrollment: {
    id: "enrollment-id",
    status: "PENDING_PAYMENT" as const
  }
};

function successfulVerification(overrides = {}) {
  return {
    provider: "FLUTTERWAVE" as const,
    providerTransactionId: "987654",
    providerReference: "topmox-payment-id",
    status: "successful" as const,
    amount: "125.00",
    currency: "USD",
    rawPayload: {
      status: "success"
    },
    ...overrides
  };
}

function createCallbackDeps(
  overrides: {
    verification?: ReturnType<typeof successfulVerification>;
    payment?: typeof pendingPayment | null;
  } = {}
) {
  const calls = {
    verify: 0,
    markPaid: 0,
    markFailed: 0,
    notify: 0
  };

  return {
    calls,
    deps: {
      verifyPayment: async () => {
        calls.verify += 1;
        return overrides.verification ?? successfulVerification();
      },
      findPaymentByProviderReference: async () =>
        overrides.payment === undefined ? pendingPayment : overrides.payment,
      markPaidAndActivate: async () => {
        calls.markPaid += 1;
        return {
          paymentId: "payment-id",
          enrollmentId: "enrollment-id",
          paymentStatus: "PAID" as const,
          enrollmentStatus: "ACTIVE" as const,
          activated: true
        };
      },
      markFailed: async () => {
        calls.markFailed += 1;
        return {
          id: "payment-id",
          status: "FAILED" as const
        };
      },
      notifyPaymentActivated: async () => {
        calls.notify += 1;
      }
    }
  };
}

describe("Flutterwave callback verification", () => {
  test("does not trust query status alone", async () => {
    const { calls, deps } = createCallbackDeps({
      verification: successfulVerification({
        status: "pending"
      })
    });

    const result = await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "topmox-payment-id",
        queryStatus: "successful"
      },
      deps
    );

    assert.equal(calls.verify, 1);
    assert.equal(calls.markPaid, 0);
    assert.equal(result.activated, false);
  });

  test("calls Flutterwave verification endpoint before activation", async () => {
    const { calls, deps } = createCallbackDeps();

    await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "topmox-payment-id",
        queryStatus: "successful"
      },
      deps
    );

    assert.equal(calls.verify, 1);
  });

  test("successful verified transaction marks payment paid and activates enrollment", async () => {
    const { calls, deps } = createCallbackDeps();

    const result = await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "topmox-payment-id"
      },
      deps
    );

    assert.equal(calls.markPaid, 1);
    assert.equal(calls.notify, 1);
    assert.equal(result.paymentStatus, "PAID");
    assert.equal(result.enrollmentStatus, "ACTIVE");
    assert.equal(result.activated, true);
  });

  test("failed transaction marks payment failed only when final failure is confirmed", async () => {
    const failed = createCallbackDeps({
      verification: successfulVerification({
        status: "failed"
      })
    });
    const pending = createCallbackDeps({
      verification: successfulVerification({
        status: "pending"
      })
    });

    await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "topmox-payment-id"
      },
      failed.deps
    );
    await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "topmox-payment-id"
      },
      pending.deps
    );

    assert.equal(failed.calls.markFailed, 1);
    assert.equal(pending.calls.markFailed, 0);
  });

  test("amount mismatch blocks activation", async () => {
    const { calls, deps } = createCallbackDeps({
      verification: successfulVerification({
        amount: "124.00"
      })
    });

    const result = await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "topmox-payment-id"
      },
      deps
    );

    assert.equal(calls.markPaid, 0);
    assert.equal(result.activated, false);
    assert.match(result.reason ?? "", /amount mismatch/i);
  });

  test("currency mismatch blocks activation", async () => {
    const { calls, deps } = createCallbackDeps({
      verification: successfulVerification({
        currency: "GBP"
      })
    });

    const result = await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "topmox-payment-id"
      },
      deps
    );

    assert.equal(calls.markPaid, 0);
    assert.equal(result.activated, false);
    assert.match(result.reason ?? "", /currency mismatch/i);
  });

  test("unknown tx_ref does not activate anything", async () => {
    const { calls, deps } = createCallbackDeps({
      payment: null
    });

    const result = await processFlutterwaveCallback(
      {
        transactionId: "987654",
        txRef: "unknown-reference"
      },
      deps
    );

    assert.equal(calls.markPaid, 0);
    assert.equal(result.activated, false);
    assert.match(result.reason ?? "", /not found/i);
  });
});

describe("Flutterwave webhook verification", () => {
  test("webhook rejects missing secret hash", async () => {
    const adapter = createFlutterwavePaymentAdapter({
      publicKey: "FLWPUBK_TEST",
      secretKey: "FLWSECK_TEST",
      secretHash: "expected-hash",
      baseUrl: "https://api.flutterwave.com/v3"
    });

    await assert.rejects(
      () =>
        adapter.handleWebhook({
          headers: {},
          payload: {
            event: "charge.completed"
          }
        }),
      /webhook verification failed/i
    );
  });

  test("webhook rejects invalid secret hash", async () => {
    const adapter = createFlutterwavePaymentAdapter({
      publicKey: "FLWPUBK_TEST",
      secretKey: "FLWSECK_TEST",
      secretHash: "expected-hash",
      baseUrl: "https://api.flutterwave.com/v3"
    });

    await assert.rejects(
      () =>
        adapter.handleWebhook({
          headers: {
            "verif-hash": "wrong-hash"
          },
          payload: {
            event: "charge.completed"
          }
        }),
      /webhook verification failed/i
    );
  });

  test("webhook records PaymentEvent before transaction verification", async () => {
    const { calls, deps } = createCallbackDeps();
    let eventRecorded = false;
    const result = await processFlutterwaveWebhook(
      {
        headers: {
          "verif-hash": "expected-hash"
        },
        payload: {
          event: "charge.completed",
          data: {
            id: 987654,
            tx_ref: "topmox-payment-id"
          }
        }
      },
      {
        ...deps,
        parseWebhook: async () => ({
          provider: "FLUTTERWAVE",
          providerEventId: "evt-987654",
          eventType: "charge.completed",
          paymentReference: "topmox-payment-id",
          transactionId: "987654",
          verificationRequired: true,
          rawPayload: {
            event: "charge.completed"
          }
        }),
        recordPaymentEvent: async () => {
          eventRecorded = true;
          return {
            duplicate: false,
            eventId: "event-id"
          };
        }
      }
    );

    assert.equal(eventRecorded, true);
    assert.equal(calls.verify, 1);
    assert.equal(result.activated, true);
  });

  test("duplicate webhook event is ignored", async () => {
    const { calls, deps } = createCallbackDeps();

    const result = await processFlutterwaveWebhook(
      {
        headers: {
          "verif-hash": "expected-hash"
        },
        payload: {}
      },
      {
        ...deps,
        parseWebhook: async () => ({
          provider: "FLUTTERWAVE",
          providerEventId: "evt-987654",
          eventType: "charge.completed",
          paymentReference: "topmox-payment-id",
          transactionId: "987654",
          verificationRequired: true,
          rawPayload: {}
        }),
        recordPaymentEvent: async () => ({
          duplicate: true,
          eventId: "event-id"
        })
      }
    );

    assert.equal(calls.verify, 0);
    assert.equal(calls.markPaid, 0);
    assert.equal(result.duplicate, true);
  });

  test("webhook verifies transaction server-side before activation", async () => {
    const { calls, deps } = createCallbackDeps({
      verification: successfulVerification({
        status: "pending"
      })
    });

    const result = await processFlutterwaveWebhook(
      {
        headers: {
          "verif-hash": "expected-hash"
        },
        payload: {}
      },
      {
        ...deps,
        parseWebhook: async () => ({
          provider: "FLUTTERWAVE",
          providerEventId: "evt-987654",
          eventType: "charge.completed",
          paymentReference: "topmox-payment-id",
          transactionId: "987654",
          verificationRequired: true,
          rawPayload: {}
        }),
        recordPaymentEvent: async () => ({
          duplicate: false,
          eventId: "event-id"
        })
      }
    );

    assert.equal(calls.verify, 1);
    assert.equal(calls.markPaid, 0);
    assert.equal(result.activated, false);
  });

  test("verified webhook success activates enrollment", async () => {
    const { calls, deps } = createCallbackDeps();

    const result = await processFlutterwaveWebhook(
      {
        headers: {
          "verif-hash": "expected-hash"
        },
        payload: {}
      },
      {
        ...deps,
        parseWebhook: async () => ({
          provider: "FLUTTERWAVE",
          providerEventId: "evt-987654",
          eventType: "charge.completed",
          paymentReference: "topmox-payment-id",
          transactionId: "987654",
          verificationRequired: true,
          rawPayload: {}
        }),
        recordPaymentEvent: async () => ({
          duplicate: false,
          eventId: "event-id"
        })
      }
    );

    assert.equal(calls.markPaid, 1);
    assert.equal(result.activated, true);
  });

  test("duplicate webhook does not activate enrollment twice", async () => {
    const { calls, deps } = createCallbackDeps();

    await processFlutterwaveWebhook(
      {
        headers: {
          "verif-hash": "expected-hash"
        },
        payload: {}
      },
      {
        ...deps,
        parseWebhook: async () => ({
          provider: "FLUTTERWAVE",
          providerEventId: "evt-987654",
          eventType: "charge.completed",
          paymentReference: "topmox-payment-id",
          transactionId: "987654",
          verificationRequired: true,
          rawPayload: {}
        }),
        recordPaymentEvent: async () => ({
          duplicate: true,
          eventId: "event-id"
        })
      }
    );

    assert.equal(calls.markPaid, 0);
  });
});
