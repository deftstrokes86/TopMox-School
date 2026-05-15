import type { PaymentProvider, PaymentStatus } from "@prisma/client";

export type PaymentProviderName = PaymentProvider;

export type CreateCheckoutInput = {
  paymentId: string;
  enrollmentId: string;
  parentId: string;
  studentId: string;
  amount: string;
  currency: string;
  redirectUrl: string;
  customer: {
    email: string;
    name: string;
  };
};

export type CreateCheckoutResult = {
  provider: PaymentProviderName;
  providerReference: string | null;
  checkoutUrl: string | null;
  status: PaymentStatus;
  shouldActivateEnrollment: boolean;
  rawPayload?: unknown;
};

export type VerifyPaymentInput = {
  transactionId?: string;
  txRef?: string;
};

export type VerifyPaymentResult = {
  provider: PaymentProviderName;
  providerTransactionId: string | null;
  providerReference: string | null;
  status: "successful" | "failed" | "pending";
  amount: string;
  currency: string;
  rawPayload?: unknown;
};

export type WebhookHandleInput = {
  headers: Record<string, string | string[] | undefined>;
  payload: unknown;
};

export type WebhookHandleResult = {
  provider: PaymentProviderName;
  providerEventId: string;
  eventType: string;
  paymentReference?: string | null;
  transactionId?: string | null;
  verificationRequired: boolean;
  rawPayload: unknown;
};

export type PaymentProviderAdapter = {
  provider: PaymentProviderName;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  handleWebhook(input: WebhookHandleInput): Promise<WebhookHandleResult>;
};

export class PaymentProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentProviderConfigurationError";
  }
}
