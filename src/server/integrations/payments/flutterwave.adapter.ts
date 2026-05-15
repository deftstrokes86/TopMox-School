import {
  type CreateCheckoutInput,
  type CreateCheckoutResult,
  PaymentProviderConfigurationError,
  type PaymentProviderAdapter,
  type VerifyPaymentInput,
  type VerifyPaymentResult,
  type WebhookHandleInput,
  type WebhookHandleResult
} from "./payment-provider";

type FetchLike = typeof fetch;

export type FlutterwaveAdapterConfig = {
  publicKey?: string;
  secretKey?: string;
  secretHash?: string;
  baseUrl?: string;
};

type FlutterwaveCheckoutResponse = {
  status?: string;
  message?: string;
  data?: {
    link?: string;
    tx_ref?: string;
  };
};

type FlutterwaveVerifyResponse = {
  status?: string;
  message?: string;
  data?: {
    id?: number | string;
    tx_ref?: string;
    status?: string;
    amount?: number | string;
    currency?: string;
  };
};

function getConfig(config?: FlutterwaveAdapterConfig) {
  return {
    publicKey: config?.publicKey ?? process.env.FLUTTERWAVE_PUBLIC_KEY,
    secretKey: config?.secretKey ?? process.env.FLUTTERWAVE_SECRET_KEY,
    secretHash: config?.secretHash ?? process.env.FLUTTERWAVE_SECRET_HASH,
    baseUrl:
      config?.baseUrl ??
      process.env.FLUTTERWAVE_BASE_URL ??
      "https://api.flutterwave.com/v3"
  };
}

function assertConfig(config: ReturnType<typeof getConfig>) {
  if (!config.publicKey || !config.secretKey || !config.baseUrl) {
    throw new PaymentProviderConfigurationError(
      "Flutterwave payment configuration is incomplete."
    );
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function createTxRef(paymentId: string) {
  return `topmox-${paymentId}`;
}

function getWebhookHeader(
  headers: WebhookHandleInput["headers"],
  key: string
): string | undefined {
  const direct = headers[key] ?? headers[key.toLowerCase()];

  return Array.isArray(direct) ? direct[0] : direct;
}

export function createFlutterwavePaymentAdapter(
  config?: FlutterwaveAdapterConfig,
  fetchFn: FetchLike = fetch
): PaymentProviderAdapter {
  const resolvedConfig = getConfig(config);

  return {
    provider: "FLUTTERWAVE",

    async createCheckout(
      input: CreateCheckoutInput
    ): Promise<CreateCheckoutResult> {
      assertConfig(resolvedConfig);

      const txRef = createTxRef(input.paymentId);
      const response = await fetchFn(
        `${normalizeBaseUrl(resolvedConfig.baseUrl)}/payments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resolvedConfig.secretKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tx_ref: txRef,
            amount: input.amount,
            currency: input.currency,
            redirect_url: input.redirectUrl,
            customer: input.customer,
            customizations: {
              title: "TopMox Global Tutoring",
              description: "TopMox tutoring plan payment"
            },
            metadata: {
              paymentId: input.paymentId,
              enrollmentId: input.enrollmentId,
              parentId: input.parentId,
              studentId: input.studentId
            }
          })
        }
      );

      const payload = (await response.json()) as FlutterwaveCheckoutResponse;

      if (!response.ok || payload.status !== "success" || !payload.data?.link) {
        throw new Error(
          payload.message || "Flutterwave checkout could not be created."
        );
      }

      return {
        provider: "FLUTTERWAVE",
        providerReference: payload.data.tx_ref ?? txRef,
        checkoutUrl: payload.data.link,
        status: "PENDING",
        shouldActivateEnrollment: false,
        rawPayload: payload
      };
    },

    async verifyPayment(
      input: VerifyPaymentInput
    ): Promise<VerifyPaymentResult> {
      assertConfig(resolvedConfig);

      if (!input.transactionId && !input.txRef) {
        throw new Error("Flutterwave transaction id or tx_ref is required.");
      }

      const verificationUrl = input.transactionId
        ? `${normalizeBaseUrl(resolvedConfig.baseUrl)}/transactions/${input.transactionId}/verify`
        : `${normalizeBaseUrl(resolvedConfig.baseUrl)}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
            input.txRef ?? ""
          )}`;

      const response = await fetchFn(
        verificationUrl,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${resolvedConfig.secretKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      const payload = (await response.json()) as FlutterwaveVerifyResponse;
      const data = payload.data;
      const isSuccessful =
        response.ok && payload.status === "success" && data?.status === "successful";

      return {
        provider: "FLUTTERWAVE",
        providerTransactionId: data?.id ? String(data.id) : null,
        providerReference: data?.tx_ref ?? input.txRef ?? null,
        status: isSuccessful
          ? "successful"
          : data?.status === "failed"
            ? "failed"
            : "pending",
        amount: data?.amount ? String(data.amount) : "0",
        currency: data?.currency ?? "",
        rawPayload: payload
      };
    },

    async handleWebhook(
      input: WebhookHandleInput
    ): Promise<WebhookHandleResult> {
      const eventPayload = input.payload as {
        event?: string;
        data?: {
          id?: number | string;
          tx_ref?: string;
        };
      };
      const configuredHash = resolvedConfig.secretHash;

      if (!configuredHash) {
        throw new PaymentProviderConfigurationError(
          "Flutterwave webhook secret hash is not configured."
        );
      }

      const receivedHash = getWebhookHeader(input.headers, "verif-hash");

      if (receivedHash !== configuredHash) {
        throw new Error("Flutterwave webhook verification failed.");
      }

      const transactionId = eventPayload.data?.id
        ? String(eventPayload.data.id)
        : null;
      const providerReference = eventPayload.data?.tx_ref ?? null;

      return {
        provider: "FLUTTERWAVE",
        providerEventId:
          transactionId ?? providerReference ?? `flutterwave-${Date.now()}`,
        eventType: eventPayload.event ?? "unknown",
        paymentReference: providerReference,
        transactionId,
        verificationRequired: true,
        rawPayload: input.payload
      };
    }
  };
}
