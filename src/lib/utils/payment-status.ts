import type { StatusTone } from "@/lib/constants/statuses";
import { PAYMENT_STATUSES } from "@/lib/constants/statuses";
import type { PaymentMethod } from "@prisma/client";

export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export type PaymentStatusMeta = {
  label: string;
  tone: StatusTone;
  parentDescription: string;
};

const PAYMENT_STATUS_META: Record<PaymentStatusValue, PaymentStatusMeta> = {
  PENDING: {
    label: "Pending",
    tone: "neutral",
    parentDescription:
      "Online checkout has started. Complete checkout so TopMox can verify the payment."
  },
  AWAITING_VERIFICATION: {
    label: "Awaiting verification",
    tone: "warning",
    parentDescription: "TopMox is reviewing your payment."
  },
  PAID: {
    label: "Paid",
    tone: "success",
    parentDescription: "Payment approved. Tutoring plan active."
  },
  FAILED: {
    label: "Failed",
    tone: "danger",
    parentDescription:
      "Payment could not be verified. Please review the admin note or contact TopMox."
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "neutral",
    parentDescription: "This payment record is no longer active."
  },
  REFUNDED: {
    label: "Refunded",
    tone: "info",
    parentDescription: "This payment has been refunded."
  }
};

export function getPaymentStatusMeta(
  status: PaymentStatusValue
): PaymentStatusMeta {
  return PAYMENT_STATUS_META[status];
}

export function getParentPaymentStatusDescription({
  paymentMethod,
  status
}: {
  paymentMethod: PaymentMethod;
  status: PaymentStatusValue;
}): string {
  if (paymentMethod === "MANUAL_TRANSFER") {
    if (status === "AWAITING_VERIFICATION") {
      return "TopMox is reviewing your payment details.";
    }

    if (status === "PAID") {
      return "Payment approved. Your tutoring plan is active.";
    }

    if (status === "FAILED") {
      return "Payment could not be verified. Please contact TopMox.";
    }
  }

  if (paymentMethod === "FLUTTERWAVE") {
    if (status === "PENDING") {
      return "Checkout pending. Continue payment.";
    }

    if (status === "PAID") {
      return "Payment confirmed. Your tutoring plan is active.";
    }

    if (status === "FAILED") {
      return "Payment was not completed or could not be verified.";
    }
  }

  return PAYMENT_STATUS_META[status].parentDescription;
}
