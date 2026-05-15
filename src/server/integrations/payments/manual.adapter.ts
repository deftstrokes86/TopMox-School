import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProviderAdapter,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookHandleInput,
  WebhookHandleResult
} from "./payment-provider";

export function createManualPaymentAdapter(): PaymentProviderAdapter {
  return {
    provider: "MANUAL",

    async createCheckout(
      input: CreateCheckoutInput
    ): Promise<CreateCheckoutResult> {
      return {
        provider: "MANUAL",
        providerReference: `manual-${input.paymentId}`,
        checkoutUrl: null,
        status: "AWAITING_VERIFICATION",
        shouldActivateEnrollment: false
      };
    },

    async verifyPayment(
      input: VerifyPaymentInput
    ): Promise<VerifyPaymentResult> {
      return {
        provider: "MANUAL",
        providerTransactionId: null,
        providerReference: input.txRef ?? null,
        status: "pending",
        amount: "0",
        currency: ""
      };
    },

    async handleWebhook(
      input: WebhookHandleInput
    ): Promise<WebhookHandleResult> {
      return {
        provider: "MANUAL",
        providerEventId: `manual-${Date.now()}`,
        eventType: "manual_payment_update",
        verificationRequired: false,
        rawPayload: input.payload
      };
    }
  };
}
