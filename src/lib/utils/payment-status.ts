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
    parentDescription:
      "TopMox is reviewing the submitted payment details before activation."
  },
  PAID: {
    label: "Paid",
    tone: "success",
    parentDescription: "This payment has been verified by TopMox."
  },
  FAILED: {
    label: "Failed",
    tone: "danger",
    parentDescription:
      "This payment could not be verified. Contact TopMox for guidance."
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
