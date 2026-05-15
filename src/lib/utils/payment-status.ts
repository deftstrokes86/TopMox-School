import type { StatusTone } from "@/lib/constants/statuses";
import { PAYMENT_STATUSES } from "@/lib/constants/statuses";

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
    parentDescription: "Payment details have not been submitted yet."
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
